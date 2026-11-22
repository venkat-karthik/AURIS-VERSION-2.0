import { WebSocket } from 'ws';
import {
  StreamingSTTProvider,
  STTEventMap,
  STTEventListener,
  STTOptions,
} from './types.ts';
import { upsample8kTo16k } from '../audioCodec.ts';

let testWebSocketFactory: ((url: string, protocols?: string | string[], options?: any) => any) | null = null;

export function setSarvamWebSocketFactoryForTesting(
  factory: ((url: string, protocols?: string | string[], options?: any) => any) | null
): void {
  testWebSocketFactory = factory;
}

export class SarvamStreamingSTTClient implements StreamingSTTProvider {
  public readonly providerName = 'SarvamAI';
  private ws: any = null;
  private options: STTOptions;
  private apiKey: string;
  private listeners: { [K in keyof STTEventMap]?: STTEventListener<K>[] } = {};
  private boundedAudioQueue: string[] = [];
  private static readonly MAX_QUEUED_CHUNKS = 50;
  private keepaliveTimer: any = null;
  private connectionTimeoutTimer: any = null;
  private _isConnected = false;
  private _isClosing = false;

  constructor(options: STTOptions) {
    this.options = options;
    this.apiKey = options.apiKey || process.env.SARVAM_API_KEY?.trim() || '';
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Connect to Sarvam's official real-time streaming WebSocket endpoint
   */
  public async connect(): Promise<void> {
    if (this._isConnected || this.ws) {
      return;
    }

    if (!this.apiKey && !testWebSocketFactory && !this.options.customWebSocketFactory) {
      console.warn(`[SarvamSTT] SARVAM_API_KEY is not configured. Speech recognition disabled for stream ${this.options.streamId}.`);
      this.emit('error', {
        code: 'API_KEY_MISSING',
        message: 'SARVAM_API_KEY is missing from server environment.',
        isFatal: false,
      });
      return;
    }

    const languageCode = this.options.languageCode || 'auto';
    const model = this.options.model || 'saaras:v3-realtime';
    const encoding = this.options.encoding || 'linear16';
    const sampleRate = this.options.sampleRate || 16000;

    const baseWsUrl = this.options.customWsUrl || 'wss://api.sarvam.ai/speech-to-text-realtime/ws';
    const queryParams = new URLSearchParams({
      language_code: languageCode,
      model,
      encoding,
      sample_rate: String(sampleRate),
    });

    const fullWsUrl = `${baseWsUrl}?${queryParams.toString()}`;
    const wsHeaders: Record<string, string> = {
      'Api-Subscription-Key': this.apiKey,
    };

    console.log(`[SarvamSTT] Connecting to Sarvam Realtime WebSocket for stream ${this.options.streamId} (Model: ${model}, Language: ${languageCode})...`);

    return new Promise((resolve) => {
      this.connectionTimeoutTimer = setTimeout(() => {
        console.warn(`[SarvamSTT] Connection timed out for stream ${this.options.streamId}`);
        this.emit('error', {
          code: 'CONNECTION_TIMEOUT',
          message: 'Connection to Sarvam STT WebSocket timed out after 5000ms',
          isFatal: false,
        });
        this.close();
        resolve();
      }, 5000);

      try {
        const factory = this.options.customWebSocketFactory || testWebSocketFactory;
        if (factory) {
          this.ws = factory(fullWsUrl, undefined, { headers: wsHeaders });
        } else {
          this.ws = new WebSocket(fullWsUrl, { headers: wsHeaders });
        }

        this.ws.on('open', () => {
          clearTimeout(this.connectionTimeoutTimer);
          this._isConnected = true;
          console.log(`[SarvamSTT] WebSocket connected successfully for stream ${this.options.streamId}`);

          // Start heartbeat keepalive (ping every 20s)
          this.startKeepalive();

          // Flush queued audio chunks if any were waiting
          this.flushQueuedAudio();
          resolve();
        });

        this.ws.on('message', (data: any) => {
          this.handleIncomingMessage(data);
        });

        this.ws.on('close', (code: number, reason: any) => {
          const reasonStr = reason ? reason.toString() : '';
          console.log(`[SarvamSTT] WebSocket closed for stream ${this.options.streamId}. Code: ${code}, Reason: ${reasonStr}`);
          this.cleanup();
          this.emit('close', { code, reason: reasonStr });
          resolve();
        });

        this.ws.on('error', (err: any) => {
          clearTimeout(this.connectionTimeoutTimer);
          console.warn(`[SarvamSTT] WebSocket error for stream ${this.options.streamId}:`, err.message || err);
          this.emit('error', {
            code: 'WEBSOCKET_ERROR',
            message: err.message || String(err),
            isFatal: false,
          });
          resolve();
        });
      } catch (err: any) {
        clearTimeout(this.connectionTimeoutTimer);
        console.warn(`[SarvamSTT] Failed to initialize WebSocket for stream ${this.options.streamId}:`, err.message);
        this.emit('error', {
          code: 'INIT_ERROR',
          message: err.message || String(err),
          isFatal: false,
        });
        resolve();
      }
    });
  }

  /**
   * Send audio frames to Sarvam.
   * Telephony audio (8kHz PCM16) is mathematically upsampled to 16kHz linear PCM,
   * base64-encoded, and sent via { event: 'audio_input', audio: base64 }
   */
  public sendAudio(pcm16: Int16Array, sourceSampleRate: number = 8000): void {
    if (this._isClosing) return;

    // Convert sample rate if needed: 8kHz telephony -> 16kHz Sarvam model
    let readyPcm16 = pcm16;
    if (sourceSampleRate === 8000) {
      readyPcm16 = upsample8kTo16k(pcm16);
    }

    // Convert Int16Array to little-endian byte buffer
    const pcmBuffer = Buffer.from(readyPcm16.buffer, readyPcm16.byteOffset, readyPcm16.byteLength);
    const base64Audio = pcmBuffer.toString('base64');

    if (!this._isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Buffer frames during connection, maintaining bounded queue
      if (this.boundedAudioQueue.length >= SarvamStreamingSTTClient.MAX_QUEUED_CHUNKS) {
        this.boundedAudioQueue.shift(); // Drop oldest frame to preserve bounded memory
      }
      this.boundedAudioQueue.push(base64Audio);
      return;
    }

    this.sendAudioFrame(base64Audio);
  }

  private sendAudioFrame(base64Audio: string): void {
    const payload = JSON.stringify({
      event: 'audio_input',
      audio: base64Audio,
    });

    try {
      this.ws.send(payload);
    } catch (err: any) {
      console.warn(`[SarvamSTT] Failed to send audio chunk on stream ${this.options.streamId}:`, err.message);
    }
  }

  private flushQueuedAudio(): void {
    while (this.boundedAudioQueue.length > 0 && this._isConnected) {
      const chunk = this.boundedAudioQueue.shift();
      if (chunk) {
        this.sendAudioFrame(chunk);
      }
    }
  }

  private handleIncomingMessage(rawData: any): void {
    let messageStr = '';
    if (typeof rawData === 'string') {
      messageStr = rawData;
    } else if (Buffer.isBuffer(rawData)) {
      messageStr = rawData.toString('utf8');
    } else {
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(messageStr);
    } catch {
      return;
    }

    const eventType = parsed?.event;
    if (!eventType) return;

    switch (eventType) {
      case 'transcript.partial': {
        const text = parsed.transcript || parsed.text || '';
        if (text) {
          this.emit('partialTranscript', {
            text,
            language: parsed.detected_language || parsed.language_code || this.options.languageCode,
            isFinal: false,
          });
        }
        break;
      }

      case 'transcript.final': {
        const text = parsed.transcript || parsed.text || '';
        if (text) {
          this.emit('finalTranscript', {
            text,
            language: parsed.detected_language || parsed.language_code || this.options.languageCode,
            isFinal: true,
            startMs: parsed.start_timestamp_ms,
            endMs: parsed.end_timestamp_ms,
          });
        }
        break;
      }

      case 'vad.speech_start':
        this.emit('speechStart', { timestampMs: parsed.timestamp_ms });
        break;

      case 'vad.speech_end':
        this.emit('speechEnd', { timestampMs: parsed.timestamp_ms });
        break;

      case 'session.begin':
        console.log(`[SarvamSTT] Session began. SessionID: ${parsed.session_id || 'ok'}`);
        break;

      case 'session.end':
        console.log(`[SarvamSTT] Session ended. Audio Duration: ${parsed.audio_duration_s || 0}s`);
        break;

      case 'error': {
        const errDetails = parsed.error || {};
        console.warn(`[SarvamSTT] Provider error on stream ${this.options.streamId}:`, errDetails.message || errDetails);
        this.emit('error', {
          code: errDetails.code || 'SARVAM_PROVIDER_ERROR',
          message: errDetails.message || 'Error reported by Sarvam STT',
          isFatal: !!errDetails.is_fatal,
        });
        break;
      }

      case 'pong':
        // Heartbeat response
        break;

      default:
        break;
    }
  }

  private startKeepalive(): void {
    this.keepaliveTimer = setInterval(() => {
      if (this._isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ event: 'ping' }));
        } catch {}
      }
    }, 20000);

    if (this.keepaliveTimer.unref) {
      this.keepaliveTimer.unref();
    }
  }

  /**
   * Gracefully close the Sarvam STT stream
   */
  public close(): void {
    if (this._isClosing) return;
    this._isClosing = true;

    if (this._isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        // Send documented graceful end event
        this.ws.send(JSON.stringify({ event: 'end' }));
        this.ws.close(1000, 'normal_end');
      } catch {}
    }

    this.cleanup();
  }

  private cleanup(): void {
    this._isConnected = false;
    clearTimeout(this.connectionTimeoutTimer);
    if (this.keepaliveTimer) {
      clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = null;
    }
    this.boundedAudioQueue = [];
    this.ws = null;
  }

  public on<K extends keyof STTEventMap>(event: K, listener: STTEventListener<K>): void {
    if (!this.listeners[event]) {
      (this.listeners as any)[event] = [];
    }
    (this.listeners[event] as STTEventListener<K>[]).push(listener);
  }

  public off<K extends keyof STTEventMap>(event: K, listener: STTEventListener<K>): void {
    if (!this.listeners[event]) return;
    (this.listeners as any)[event] = (this.listeners[event] as STTEventListener<K>[]).filter((l) => l !== listener);
  }

  private emit<K extends keyof STTEventMap>(event: K, data: STTEventMap[K]): void {
    const handlers = this.listeners[event];
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (err: any) {
          console.warn(`[SarvamSTT] Error in listener for "${event}":`, err.message);
        }
      }
    }
  }
}
