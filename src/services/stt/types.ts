/**
 * Universal Streaming Speech-to-Text (STT) Interfaces
 * Provider-independent abstraction allowing Auris to plug in Sarvam AI,
 * Azure Speech, or self-hosted Whisper engines without rewriting the media gateway.
 */

export interface STTPartialTranscriptEvent {
  text: string;
  language?: string;
  isFinal: false;
}

export interface STTFinalTranscriptEvent {
  text: string;
  language?: string;
  isFinal: true;
  startMs?: number;
  endMs?: number;
}

export interface STTSpeechStartEvent {
  timestampMs?: number;
}

export interface STTSpeechEndEvent {
  timestampMs?: number;
}

export interface STTErrorEvent {
  code: string;
  message: string;
  isFatal: boolean;
}

export interface STTCloseEvent {
  code: number;
  reason: string;
}

export interface STTEventMap {
  partialTranscript: STTPartialTranscriptEvent;
  finalTranscript: STTFinalTranscriptEvent;
  speechStart: STTSpeechStartEvent;
  speechEnd: STTSpeechEndEvent;
  error: STTErrorEvent;
  close: STTCloseEvent;
}

export type STTEventListener<K extends keyof STTEventMap> = (data: STTEventMap[K]) => void;

export interface STTOptions {
  callId: string;
  streamId: string;
  languageCode?: string; // e.g. 'te-IN', 'hi-IN', 'en-IN', 'auto'
  model?: string; // e.g. 'saaras:v3-realtime'
  sampleRate?: number; // 8000 or 16000
  encoding?: string; // 'linear16'
  apiKey?: string;
  customWsUrl?: string; // For testing or on-prem deployments
  customWebSocketFactory?: (url: string, protocols?: string | string[], options?: any) => any;
}

export interface StreamingSTTProvider {
  readonly providerName: string;
  readonly isConnected: boolean;
  connect(): Promise<void>;
  sendAudio(pcm8kOr16k: Int16Array, sourceSampleRate?: number): void;
  close(): void;
  on<K extends keyof STTEventMap>(event: K, listener: STTEventListener<K>): void;
  off<K extends keyof STTEventMap>(event: K, listener: STTEventListener<K>): void;
}
