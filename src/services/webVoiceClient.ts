/**
 * Auris 2.0 In-Browser Real-Time Voice Audio Client
 *
 * Connects the browser microphone directly to the Auris Voice Engine over WebSocket.
 * Features:
 * - 8000Hz G.711 μ-law bidirectional real-time audio streaming
 * - Hardware Echo Cancellation & Noise Suppression
 * - Instantaneous client-side Barge-In (<50ms audio purge)
 * - Live Subtitles & Transcript streaming (Caller & Agent)
 * - RMS Volume metering for animated audio waves
 */

import { decodeMuLaw, linearSampleToMuLaw } from './audioCodec.ts';

export type WebVoiceCallStatus =
  | 'idle'
  | 'requesting-permission'
  | 'connecting'
  | 'connected'
  | 'speaking'
  | 'listening'
  | 'disconnected'
  | 'error';

export interface WebVoiceTranscriptEvent {
  speaker: 'caller' | 'agent';
  text: string;
  isFinal: boolean;
  timestamp: string;
}

export interface WebVoiceClientOptions {
  onStatusChange?: (status: WebVoiceCallStatus, detail?: string) => void;
  onTranscript?: (event: WebVoiceTranscriptEvent) => void;
  onVolume?: (volumes: { input: number; output: number }) => void;
  onInterrupted?: () => void;
}

export class WebVoiceClient {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private activeSources = new Set<AudioBufferSourceNode>();
  private nextPlaybackTime = 0;
  private isMuted = false;
  private callId = '';
  private status: WebVoiceCallStatus = 'idle';
  private options: WebVoiceClientOptions;
  private inputBuffer: number[] = [];
  private static readonly TARGET_SAMPLE_RATE = 8000;
  private static readonly FRAME_SIZE_BYTES = 320; // 40ms of 8000Hz 8-bit mulaw

  constructor(options: WebVoiceClientOptions = {}) {
    this.options = options;
  }

  public getStatus(): WebVoiceCallStatus {
    return this.status;
  }

  public getCallId(): string {
    return this.callId;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (this.micStream) {
      this.micStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  private setStatus(status: WebVoiceCallStatus, detail?: string): void {
    this.status = status;
    this.options.onStatusChange?.(status, detail);
  }

  /**
   * Start a live in-browser voice session with the specified agent
   */
  public async startSession(params: { agentId: string; language?: string }): Promise<void> {
    if (this.status !== 'idle' && this.status !== 'disconnected' && this.status !== 'error') {
      console.warn('[WebVoiceClient] Session already active or starting');
      return;
    }

    try {
      this.setStatus('requesting-permission');

      // 1. Request microphone access with telecom audio constraints
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });

      this.setStatus('connecting');

      // 2. Request web call session token from Auris backend
      const res = await fetch('/api/voice/web-call/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned ${res.status}`);
      }

      const { callId, token, langCode } = await res.json();
      this.callId = callId;

      // 3. Connect to WebSocket /media-stream route
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/media-stream?callId=${encodeURIComponent(callId)}&token=${encodeURIComponent(token)}&lang=${encodeURIComponent(langCode || 'te-IN')}`;

      this.ws = new WebSocket(wsUrl);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        console.log(`[WebVoiceClient] WebSocket connected for call ${this.callId}`);
        // Send initial start event conforming to standard Auris telephony format
        const startPayload = {
          event: 'start',
          streamId: this.callId,
          callId: this.callId,
          start: {
            streamId: this.callId,
            callId: this.callId,
            mediaFormat: {
              encoding: 'audio/x-mulaw',
              sampleRate: 8000,
              channels: 1,
            },
          },
        };
        this.ws?.send(JSON.stringify(startPayload));
        this.setStatus('connected');
        this.setupAudioNodes();
      };

      this.ws.onmessage = (event) => {
        this.handleServerMessage(event.data);
      };

      this.ws.onerror = (err) => {
        console.error('[WebVoiceClient] WebSocket error:', err);
        this.setStatus('error', 'WebSocket connection error');
      };

      this.ws.onclose = () => {
        console.log('[WebVoiceClient] WebSocket closed');
        if (this.status !== 'idle' && this.status !== 'error') {
          this.setStatus('disconnected');
        }
        this.cleanupAudio();
      };
    } catch (err: any) {
      console.error('[WebVoiceClient] Failed to start voice session:', err);
      this.setStatus('error', err.message || 'Microphone access denied or connection failed');
      this.cleanupAudio();
      throw err;
    }
  }

  /**
   * Set up Web Audio pipeline for microphone capture, resampling, and μ-law encoding
   */
  private setupAudioNodes(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      this.nextPlaybackTime = this.audioContext.currentTime;

      if (!this.micStream) return;
      this.micSource = this.audioContext.createMediaStreamSource(this.micStream);

      // Buffer size: 2048 gives low latency (~42ms @ 48kHz)
      const bufferSize = 2048;
      this.processorNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

      const sourceSampleRate = this.audioContext.sampleRate;
      this.inputBuffer = [];

      this.processorNode.onaudioprocess = (e) => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        if (this.isMuted) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // 1. Calculate RMS volume for live audio visualizer
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.min(1, Math.sqrt(sum / inputData.length) * 4);
        this.options.onVolume?.({ input: rms, output: this.activeSources.size > 0 ? 0.7 : 0 });

        // 2. Downsample linear float32 from browser sample rate to 8000Hz PCM16
        const resampleRatio = sourceSampleRate / WebVoiceClient.TARGET_SAMPLE_RATE;
        for (let outIdx = 0; outIdx < inputData.length / resampleRatio; outIdx++) {
          const inIdx = Math.floor(outIdx * resampleRatio);
          if (inIdx < inputData.length) {
            const floatSample = Math.max(-1, Math.min(1, inputData[inIdx]));
            const pcm16Sample = Math.round(floatSample * 32767);
            const ulawByte = linearSampleToMuLaw(pcm16Sample);
            this.inputBuffer.push(ulawByte);
          }
        }

        // 3. Emit 40ms chunks (320 bytes @ 8kHz)
        while (this.inputBuffer.length >= WebVoiceClient.FRAME_SIZE_BYTES) {
          const frame = this.inputBuffer.splice(0, WebVoiceClient.FRAME_SIZE_BYTES);
          const uint8 = new Uint8Array(frame);
          let binaryStr = '';
          for (let i = 0; i < uint8.length; i++) {
            binaryStr += String.fromCharCode(uint8[i]);
          }
          const base64Payload = btoa(binaryStr);

          const mediaMsg = {
            event: 'media',
            media: {
              payload: base64Payload,
            },
          };
          this.ws.send(JSON.stringify(mediaMsg));
        }
      };

      this.micSource.connect(this.processorNode);
      // Dummy destination connection required for ScriptProcessor to fire
      const muteGain = this.audioContext.createGain();
      muteGain.gain.value = 0;
      this.processorNode.connect(muteGain);
      muteGain.connect(this.audioContext.destination);
    } catch (err: any) {
      console.error('[WebVoiceClient] Audio pipeline setup error:', err);
    }
  }

  /**
   * Handle incoming WebSocket frames from Auris Voice Engine
   */
  private handleServerMessage(data: any): void {
    let parsed: any;
    try {
      if (typeof data === 'string') {
        parsed = JSON.parse(data);
      } else {
        return;
      }
    } catch {
      return;
    }

    const eventType = parsed?.event;

    // 1. Audio Playback Chunk (G.711 μ-law from Sarvam Bulbul / Cartesia)
    if (eventType === 'playAudio' && parsed.media?.payload) {
      this.queueAudioFrame(parsed.media.payload);
      return;
    }

    // 2. Instantaneous Client-Side Barge-In
    if (eventType === 'clearAudio') {
      this.purgeAudioPlayback();
      this.options.onInterrupted?.();
      return;
    }

    // 3. Real-time Transcript Stream (Caller or Assistant)
    if (eventType === 'transcript' && parsed.text) {
      this.options.onTranscript?.({
        speaker: parsed.speaker || 'agent',
        text: parsed.text,
        isFinal: !!parsed.isFinal,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
      return;
    }

    // 4. Status Events
    if (eventType === 'status') {
      if (parsed.status === 'closed') {
        this.setStatus('disconnected', 'Call completed');
      }
    }
  }

  /**
   * Decode μ-law payload and queue seamlessly onto the Web Audio timeline
   */
  private queueAudioFrame(base64Payload: string): void {
    if (!this.audioContext) return;

    try {
      const binaryStr = atob(base64Payload);
      const len = binaryStr.length;
      const ulawBytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        ulawBytes[i] = binaryStr.charCodeAt(i);
      }

      // Decompress μ-law to 16-bit linear PCM (8000Hz)
      const pcm16 = decodeMuLaw(ulawBytes);

      // Convert Int16 to Float32 [-1.0, 1.0]
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      // Create Web Audio Buffer
      const audioBuffer = this.audioContext.createBuffer(1, float32.length, WebVoiceClient.TARGET_SAMPLE_RATE);
      audioBuffer.getChannelData(0).set(float32);

      // Schedule gapless playback
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      const currentTime = this.audioContext.currentTime;
      const startTime = Math.max(currentTime, this.nextPlaybackTime);
      source.start(startTime);
      this.nextPlaybackTime = startTime + audioBuffer.duration;

      this.activeSources.add(source);
      this.setStatus('speaking');

      source.onended = () => {
        this.activeSources.delete(source);
        if (this.activeSources.size === 0 && this.status === 'speaking') {
          this.setStatus('listening');
        }
      };
    } catch (err: any) {
      console.warn('[WebVoiceClient] Error decoding audio frame:', err.message);
    }
  }

  /**
   * Instantly cancel all queued and currently playing speech (barge-in)
   */
  public purgeAudioPlayback(): void {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Source may already have ended
      }
    }
    this.activeSources.clear();
    if (this.audioContext) {
      this.nextPlaybackTime = this.audioContext.currentTime;
    }
    if (this.status === 'speaking') {
      this.setStatus('listening');
    }
    console.log('[WebVoiceClient] Client audio purged (barge-in active)');
  }

  /**
   * End the call cleanly, notifying backend and releasing microphone hardware
   */
  public async hangup(): Promise<void> {
    if (this.callId) {
      try {
        await fetch('/api/voice/web-call/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId: this.callId }),
        });
      } catch {
        // Non-blocking cleanup
      }
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ event: 'stop' }));
        this.ws.close();
      } catch {}
    }

    this.cleanupAudio();
    this.setStatus('disconnected');
    this.callId = '';
  }

  private cleanupAudio(): void {
    this.purgeAudioPlayback();

    if (this.processorNode) {
      try {
        this.processorNode.disconnect();
      } catch {}
      this.processorNode = null;
    }

    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch {}
      this.micSource = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    this.inputBuffer = [];
  }
}

