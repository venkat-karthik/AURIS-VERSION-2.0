import { WebSocket, WebSocketServer } from 'ws';
import type http from 'http';
import fs from 'fs';
import path from 'path';
import { decodeMuLaw, encodeMuLaw, createWavFromMuLaw } from './audioCodec.ts';
import { verifyStreamAuthToken } from './telephonyService.ts';
import { StreamingSTTProvider } from './stt/types.ts';
import { createStreamingSTT } from './stt/sttFactory.ts';

export interface MediaFormat {
  encoding: string;
  sampleRate: number;
  channels: number;
}

export interface MediaSession {
  streamId: string;
  callId: string;
  agentId?: string;
  callerNumber?: string;
  languageCode?: string;
  sttClient?: StreamingSTTProvider;
  ws: WebSocket;
  createdAt: number;
  lastActiveAt: number;
  inboundMediaChunks: number;
  inboundBytes: number;
  outboundMediaChunks: number;
  outboundBytes: number;
  isStarted: boolean;
  isClosed: boolean;
  mediaFormat: MediaFormat;
  audioBufferQueue: Buffer[];
  maxQueueSize: number;
  playbackQueue?: Buffer[];
  activePlaybackTimer?: any;
  audioRecordingChunks?: Buffer[];
}

export type MediaSessionListener = (event: {
  type: 'start' | 'media' | 'stop' | 'dtmf' | 'close' | 'partialTranscript' | 'finalTranscript' | 'speechStart' | 'speechEnd';
  session: MediaSession;
  pcm16?: Int16Array;
  dtmfDigit?: string;
  transcript?: string;
  language?: string;
  isFinal?: boolean;
  recordingWav?: Buffer;
}) => void;

export class MediaStreamManager {
  private wss: WebSocketServer | null = null;
  private sessionsByStreamId = new Map<string, MediaSession>();
  private sessionsByCallId = new Map<string, MediaSession>();
  private listeners: MediaSessionListener[] = [];
  private static readonly MAX_PAYLOAD_BYTES = 8192; // Max 8KB per base64 payload to prevent memory overflow
  private static readonly MAX_AUDIO_QUEUE = 50; // Max ~1 second of buffered frames (20ms each)
  private reaperInterval: any = null;

  constructor() {
    // Session reaper for idle or leaked sessions (runs every 30s)
    this.reaperInterval = setInterval(() => this.reapStaleSessions(), 30000);
    if (this.reaperInterval.unref) {
      this.reaperInterval.unref();
    }
  }

  /**
   * Attach the WebSocket server to an existing HTTP server on a dedicated route
   */
  public attachToServer(httpServer: http.Server, routePath: string = '/media-stream'): WebSocketServer {
    if (this.wss) {
      return this.wss;
    }

    this.wss = new WebSocketServer({ noServer: true });

    httpServer.on('upgrade', (request, socket, head) => {
      const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
      if (url.pathname === routePath || url.pathname === '/api/telephony/media-stream') {
        // Validate session token if present
        const callId = url.searchParams.get('callId') || '';
        const token = url.searchParams.get('token') || '';

        if (token && callId && !verifyStreamAuthToken(callId, token)) {
          console.warn(`[MediaGateway] Rejected unauthorized WebSocket upgrade for callId: ${callId}`);
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }

        this.wss?.handleUpgrade(request, socket, head, (ws) => {
          this.handleConnection(ws, request);
        });
      }
    });

    console.log(`[MediaGateway] Attached WebSocket server to route ${routePath}`);
    return this.wss;
  }

  /**
   * Handle incoming WebSocket connection
   */
  public handleConnection(ws: WebSocket, request: http.IncomingMessage): void {
    const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    const queryCallId = url.searchParams.get('callId') || '';
    const queryLang = url.searchParams.get('lang') || 'auto';
    const tempSessionId = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    console.log(`[MediaGateway] New WebSocket connection established: ${tempSessionId} (CallId: ${queryCallId || 'unassigned'}, Lang: ${queryLang})`);

    // Create preliminary session record
    const session: MediaSession = {
      streamId: '',
      callId: queryCallId,
      languageCode: queryLang,
      ws,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      inboundMediaChunks: 0,
      inboundBytes: 0,
      outboundMediaChunks: 0,
      outboundBytes: 0,
      isStarted: false,
      isClosed: false,
      mediaFormat: {
        encoding: 'audio/x-mulaw',
        sampleRate: 8000,
        channels: 1,
      },
      audioBufferQueue: [],
      maxQueueSize: MediaStreamManager.MAX_AUDIO_QUEUE,
      audioRecordingChunks: [],
    };

    if (queryCallId) {
      this.sessionsByCallId.set(queryCallId, session);
    }

    ws.on('message', (data: Buffer | string) => {
      this.handleMessage(session, data);
    });

    ws.on('close', (code, reason) => {
      console.log(`[MediaGateway] WebSocket connection closed. Code: ${code}, Reason: ${reason.toString()}`);
      this.closeSession(session.streamId || tempSessionId, 'socket_closed');
    });

    ws.on('error', (err) => {
      console.warn(`[MediaGateway] WebSocket error on session ${session.streamId || tempSessionId}:`, err.message);
      this.closeSession(session.streamId || tempSessionId, 'socket_error');
    });
  }

  /**
   * Parse and dispatch incoming Plivo WebSocket stream messages
   */
  public handleMessage(session: MediaSession, rawData: Buffer | string): void {
    if (session.isClosed) return;

    session.lastActiveAt = Date.now();
    let messageStr: string;

    if (typeof rawData === 'string') {
      messageStr = rawData;
    } else if (Buffer.isBuffer(rawData)) {
      messageStr = rawData.toString('utf8');
    } else {
      console.warn('[MediaGateway] Unsupported binary WebSocket frame discarded');
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(messageStr);
    } catch {
      console.warn('[MediaGateway] Malformed JSON message discarded from stream');
      return;
    }

    const eventType = parsed?.event;
    if (!eventType) return;

    switch (eventType) {
      case 'start':
        this.handleStartEvent(session, parsed);
        break;

      case 'media':
        this.handleMediaEvent(session, parsed);
        break;

      case 'dtmf':
        this.handleDtmfEvent(session, parsed);
        break;

      case 'stop':
        this.handleStopEvent(session, parsed);
        break;

      default:
        // Other events like playedStream or clearedAudio
        console.log(`[MediaGateway] Provider status event: ${eventType}`);
        break;
    }
  }

  private handleStartEvent(session: MediaSession, parsed: any): void {
    const startData = parsed.start || {};
    const streamId = startData.streamId || parsed.streamId || `stream_${Date.now()}`;
    const callId = startData.callId || session.callId || `call_${Date.now()}`;

    // Handle duplicate start idempotently
    if (session.isStarted) {
      console.log(`[MediaGateway] Duplicate start event for streamId ${streamId}. Ignoring.`);
      return;
    }

    session.streamId = streamId;
    session.callId = callId;
    session.isStarted = true;

    if (startData.mediaFormat) {
      session.mediaFormat = {
        encoding: startData.mediaFormat.encoding || 'audio/x-mulaw',
        sampleRate: Number(startData.mediaFormat.sampleRate) || 8000,
        channels: Number(startData.mediaFormat.channels) || 1,
      };
    }

    this.sessionsByStreamId.set(streamId, session);
    this.sessionsByCallId.set(callId, session);

    console.log(`[MediaGateway] Stream session started: ${streamId} for Call: ${callId} (${session.mediaFormat.encoding}, ${session.mediaFormat.sampleRate}Hz)`);
    this.notifyListeners({ type: 'start', session });

    // Initialize isolated real-time STT client for this session
    try {
      const sttClient = createStreamingSTT({
        callId,
        streamId,
        languageCode: session.languageCode || 'auto',
      });
      session.sttClient = sttClient;

      sttClient.on('partialTranscript', (evt) => {
        this.notifyListeners({
          type: 'partialTranscript',
          session,
          transcript: evt.text,
          language: evt.language,
          isFinal: false,
        });
      });

      sttClient.on('finalTranscript', (evt) => {
        this.notifyListeners({
          type: 'finalTranscript',
          session,
          transcript: evt.text,
          language: evt.language,
          isFinal: true,
        });
      });

      // Sarvam VAD event: user started speaking -> real-time barge-in
      sttClient.on('speechStart', () => {
        this.clearAudioStream(streamId);
        this.notifyListeners({
          type: 'speechStart',
          session,
        });
      });

      sttClient.on('speechEnd', () => {
        this.notifyListeners({
          type: 'speechEnd',
          session,
        });
      });

      sttClient.on('error', (err) => {
        console.warn(`[MediaGateway] STT error on stream ${streamId}: [${err.code}] ${err.message}`);
      });

      // Connect STT in background without blocking Plivo start response
      sttClient.connect().catch((err: any) => {
        console.warn(`[MediaGateway] STT connection failed for stream ${streamId}:`, err.message);
      });
    } catch (sttErr: any) {
      console.warn(`[MediaGateway] Could not initialize STT for stream ${streamId}:`, sttErr.message);
    }
  }

  private handleMediaEvent(session: MediaSession, parsed: any): void {
    const media = parsed.media || {};
    const payloadBase64 = media.payload;

    if (!payloadBase64 || typeof payloadBase64 !== 'string') {
      return;
    }

    // Enforce payload size limit to prevent memory exhaustion
    if (payloadBase64.length > MediaStreamManager.MAX_PAYLOAD_BYTES) {
      console.warn(`[MediaGateway] Oversized audio chunk (${payloadBase64.length} chars) dropped from stream ${session.streamId}`);
      return;
    }

    try {
      const ulawBuffer = Buffer.from(payloadBase64, 'base64');
      const pcm16 = decodeMuLaw(ulawBuffer);

      // Maintain bounded FIFO audio queue
      if (session.audioBufferQueue.length >= session.maxQueueSize) {
        session.audioBufferQueue.shift(); // Drop oldest frame to preserve bounded memory
      }
      session.audioBufferQueue.push(ulawBuffer);

      session.inboundMediaChunks += 1;
      session.inboundBytes += ulawBuffer.length;

      // Capture inbound audio frame for session recording
      if (session.audioRecordingChunks && session.audioRecordingChunks.length < 90000) {
        session.audioRecordingChunks.push(ulawBuffer);
      }

      // Forward decoded PCM16 (8kHz) to isolated STT client
      if (session.sttClient) {
        session.sttClient.sendAudio(pcm16, 8000);
      }

      this.notifyListeners({ type: 'media', session, pcm16 });
    } catch (err: any) {
      console.warn(`[MediaGateway] Audio decode error on stream ${session.streamId}:`, err.message);
    }
  }

  private handleDtmfEvent(session: MediaSession, parsed: any): void {
    const digit = parsed.dtmf?.digit || parsed.digit || '';
    console.log(`[MediaGateway] DTMF digit received on stream ${session.streamId}: ${digit}`);
    this.notifyListeners({ type: 'dtmf', session, dtmfDigit: digit });
  }

  private handleStopEvent(session: MediaSession, parsed: any): void {
    console.log(`[MediaGateway] Stop event received for stream ${session.streamId}`);
    this.notifyListeners({ type: 'stop', session });
    this.closeSession(session.streamId, 'provider_stop');
  }

  /**
   * Play G.711 μ-law audio to the caller over the active WebSocket stream.
   * Chunks large audio buffers into 40ms real-time frames (320 bytes @ 8kHz)
   * to prevent Plivo buffer_overflow errors and ensure smooth natural cadence.
   */
  public playAudioToStream(streamId: string, ulawPayload: Buffer): boolean {
    const session = this.sessionsByStreamId.get(streamId) || this.sessionsByCallId.get(streamId);
    if (!session || session.isClosed || session.ws.readyState !== WebSocket.OPEN) {
      console.warn(`[MediaGateway] playAudioToStream failed: session ${streamId} not found or ws not open.`);
      return false;
    }

    const FRAME_SIZE = 320; // 40ms of 8000Hz 8-bit mulaw
    const FRAME_INTERVAL_MS = 38; // 38ms interval to guarantee smooth real-time streaming

    const frames: Buffer[] = [];
    for (let offset = 0; offset < ulawPayload.length; offset += FRAME_SIZE) {
      frames.push(ulawPayload.subarray(offset, Math.min(offset + FRAME_SIZE, ulawPayload.length)));
    }

    if (!session.playbackQueue) {
      session.playbackQueue = [];
    }

    session.playbackQueue.push(...frames);
    console.log(`[MediaGateway] Queued ${frames.length} audio frames (${ulawPayload.length} bytes) to stream ${session.streamId} (queue depth: ${session.playbackQueue.length})`);

    // Capture outbound audio frames for session recording
    if (session.audioRecordingChunks && session.audioRecordingChunks.length < 90000) {
      session.audioRecordingChunks.push(ulawPayload);
    }

    if (!session.activePlaybackTimer) {
      const sendNextFrame = () => {
        if (!session.playbackQueue || session.playbackQueue.length === 0) {
          if (session.activePlaybackTimer) {
            clearInterval(session.activePlaybackTimer);
            session.activePlaybackTimer = null;
          }
          return;
        }

        const frame = session.playbackQueue.shift();
        if (frame && session.ws.readyState === WebSocket.OPEN) {
          const message = JSON.stringify({
            event: 'playAudio',
            media: {
              contentType: 'audio/x-mulaw',
              sampleRate: 8000,
              payload: frame.toString('base64'),
            },
          });
          session.ws.send(message);
          session.outboundMediaChunks += 1;
          session.outboundBytes += frame.length;
        }
      };

      // Send first frame immediately
      sendNextFrame();
      if (session.playbackQueue.length > 0) {
        session.activePlaybackTimer = setInterval(sendNextFrame, FRAME_INTERVAL_MS);
      }
    }

    return true;
  }

  /**
   * Play 16-bit linear PCM audio to caller (encodes to G.711 μ-law automatically)
   */
  public playPcm16ToStream(streamId: string, pcm16: Int16Array): boolean {
    const ulawBuffer = encodeMuLaw(pcm16);
    return this.playAudioToStream(streamId, ulawBuffer);
  }

  /**
   * Clear queued audio buffers on provider side for real-time barge-in
   */
  public clearAudioStream(streamId: string): boolean {
    const session = this.sessionsByStreamId.get(streamId) || this.sessionsByCallId.get(streamId);
    if (!session || session.isClosed || session.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    const hadPendingAudio = (session.playbackQueue && session.playbackQueue.length > 0) || !!session.activePlaybackTimer;

    if (session.activePlaybackTimer) {
      clearInterval(session.activePlaybackTimer);
      session.activePlaybackTimer = null;
    }
    session.playbackQueue = [];

    const message = JSON.stringify({
      event: 'clearAudio',
      streamId: session.streamId,
    });

    session.ws.send(message);
    if (hadPendingAudio) {
      console.log(`[MediaGateway] Barge-in: cleared pending audio playback for stream ${session.streamId}`);
    }
    return true;
  }

  /**
   * Send checkpoint to track playback queue progress
   */
  public sendCheckpoint(streamId: string, name: string): boolean {
    const session = this.sessionsByStreamId.get(streamId);
    if (!session || session.isClosed || session.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    const message = JSON.stringify({
      event: 'checkpoint',
      name,
    });

    session.ws.send(message);
    return true;
  }

  /**
   * Close and clean up a media stream session
   */
  public closeSession(streamIdOrKey: string, reason: string = 'normal'): void {
    const session = this.sessionsByStreamId.get(streamIdOrKey) || this.sessionsByCallId.get(streamIdOrKey);
    if (!session) return;

    session.isClosed = true;
    if (session.activePlaybackTimer) {
      clearInterval(session.activePlaybackTimer);
      session.activePlaybackTimer = null;
    }
    session.playbackQueue = [];
    session.audioBufferQueue = []; // Free queued audio memory immediately

    // Clean up isolated STT stream safely
    if (session.sttClient) {
      try {
        session.sttClient.close();
      } catch (err: any) {
        console.warn(`[MediaGateway] Error closing STT client for stream ${session.streamId}:`, err.message);
      }
      session.sttClient = undefined;
    }

    if (session.ws && session.ws.readyState === WebSocket.OPEN) {
      session.ws.close(1000, reason);
    }

    if (session.streamId) {
      this.sessionsByStreamId.delete(session.streamId);
    }
    if (session.callId) {
      this.sessionsByCallId.delete(session.callId);
    }

    let recordingWav: Buffer | undefined;
    if (session.audioRecordingChunks && session.audioRecordingChunks.length > 0) {
      try {
        const fullUlaw = Buffer.concat(session.audioRecordingChunks);
        recordingWav = createWavFromMuLaw(fullUlaw, 8000);
        const targetId = session.callId || session.streamId;
        if (targetId) {
          const recDir = path.join(process.cwd(), 'data', 'recordings');
          if (!fs.existsSync(recDir)) fs.mkdirSync(recDir, { recursive: true });
          const filePath = path.join(recDir, `${targetId}.wav`);
          fs.writeFileSync(filePath, recordingWav);
          console.log(`[MediaGateway] Saved live call recording (${recordingWav.length} bytes) to ${filePath}`);
        }
      } catch (recErr: any) {
        console.warn('[MediaGateway] Could not build call recording WAV:', recErr.message);
      }
    }

    this.notifyListeners({ type: 'close', session, recordingWav });
    console.log(`[MediaGateway] Cleaned up media session (StreamId: ${session.streamId}, Reason: ${reason}). Active sessions: ${this.sessionsByStreamId.size}`);
  }

  /**
   * Reap sessions that have been idle for > 60 seconds
   */
  private reapStaleSessions(): void {
    const now = Date.now();
    for (const [streamId, session] of this.sessionsByStreamId.entries()) {
      if (now - session.lastActiveAt > 60000) {
        console.warn(`[MediaGateway] Reaping idle/stale stream session: ${streamId}`);
        this.closeSession(streamId, 'idle_timeout');
      }
    }
  }

  public getSession(streamId: string): MediaSession | undefined {
    return this.sessionsByStreamId.get(streamId);
  }

  public getSessionByCallId(callId: string): MediaSession | undefined {
    return this.sessionsByCallId.get(callId);
  }

  public getAllActiveSessions(): MediaSession[] {
    return Array.from(this.sessionsByStreamId.values());
  }

  public addListener(listener: MediaSessionListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(event: {
    type: 'start' | 'media' | 'stop' | 'dtmf' | 'close' | 'partialTranscript' | 'finalTranscript' | 'speechStart' | 'speechEnd';
    session: MediaSession;
    pcm16?: Int16Array;
    dtmfDigit?: string;
    transcript?: string;
    language?: string;
    isFinal?: boolean;
  }): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err: any) {
        console.warn('[MediaGateway] Listener error:', err.message);
      }
    }
  }

  public cleanupAllSessions(): void {
    for (const streamId of Array.from(this.sessionsByStreamId.keys())) {
      this.closeSession(streamId, 'server_shutdown');
    }
    if (this.reaperInterval) {
      clearInterval(this.reaperInterval);
    }
  }
}

export const mediaStreamManager = new MediaStreamManager();
