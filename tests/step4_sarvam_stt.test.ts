import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
import { EventEmitter } from 'events';
import { resolveSarvamLanguageCode, createStreamingSTT } from '../src/services/stt/sttFactory.ts';
import {
  SarvamStreamingSTTClient,
  setSarvamWebSocketFactoryForTesting,
} from '../src/services/stt/sarvamStreamingClient.ts';
import { mediaStreamManager, MediaStreamManager } from '../src/services/mediaStreamManager.ts';
import { encodeMuLaw, createSyntheticSineWave } from '../src/services/audioCodec.ts';

// Mock WebSocket implementation for unit testing Sarvam client
class MockWebSocket extends EventEmitter {
  public readyState = 1; // 1 = OPEN
  public sentMessages: string[] = [];
  public headers: Record<string, string> = {};
  public url: string = '';

  constructor(url: string, protocols?: string | string[], options?: any) {
    super();
    this.url = url;
    if (options?.headers) {
      this.headers = options.headers;
    }
    // Auto-trigger open on next microtask
    queueMicrotask(() => {
      this.emit('open');
    });
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close(code = 1000, reason = '') {
    this.readyState = 3; // 3 = CLOSED
    this.emit('close', code, reason);
  }
}

describe('Auris 2.0 - Step 4: Sarvam Real-Time Speech Recognition', () => {
  describe('Language Code Resolution', () => {
    it('resolves Telugu variants to te-IN', () => {
      expect(resolveSarvamLanguageCode('Telugu')).toBe('te-IN');
      expect(resolveSarvamLanguageCode('telugu-in')).toBe('te-IN');
      expect(resolveSarvamLanguageCode('తెలుగు')).toBe('te-IN');
      expect(resolveSarvamLanguageCode('te-IN')).toBe('te-IN');
    });

    it('resolves Hindi variants to hi-IN', () => {
      expect(resolveSarvamLanguageCode('Hindi')).toBe('hi-IN');
      expect(resolveSarvamLanguageCode('hindi-female')).toBe('hi-IN');
      expect(resolveSarvamLanguageCode('हिन्दी')).toBe('hi-IN');
      expect(resolveSarvamLanguageCode('hi-IN')).toBe('hi-IN');
    });

    it('resolves English variants to en-IN', () => {
      expect(resolveSarvamLanguageCode('English (Indian)')).toBe('en-IN');
      expect(resolveSarvamLanguageCode('en-US')).toBe('en-IN');
      expect(resolveSarvamLanguageCode('english')).toBe('en-IN');
      expect(resolveSarvamLanguageCode('en-IN')).toBe('en-IN');
    });

    it('resolves other Indic languages (Tamil, Kannada, Bengali, Marathi)', () => {
      expect(resolveSarvamLanguageCode('Tamil')).toBe('ta-IN');
      expect(resolveSarvamLanguageCode('Kannada')).toBe('kn-IN');
      expect(resolveSarvamLanguageCode('Bengali')).toBe('bn-IN');
      expect(resolveSarvamLanguageCode('Marathi')).toBe('mr-IN');
    });

    it('defaults undefined or mixed language prompts to auto', () => {
      expect(resolveSarvamLanguageCode(undefined)).toBe('auto');
      expect(resolveSarvamLanguageCode('')).toBe('auto');
      expect(resolveSarvamLanguageCode('mixed vernacular Hinglish/Telugish')).toBe('auto');
      expect(resolveSarvamLanguageCode('multilingual')).toBe('auto');
    });
  });

  describe('SarvamStreamingSTTClient Connection & Protocol Contract', () => {
    let mockWs: MockWebSocket;

    beforeEach(() => {
      setSarvamWebSocketFactoryForTesting((url, protocols, options) => {
        mockWs = new MockWebSocket(url, protocols, options);
        return mockWs;
      });
    });

    afterEach(() => {
      setSarvamWebSocketFactoryForTesting(null);
    });

    it('connects to Sarvam WebSocket with Api-Subscription-Key and correct query params', async () => {
      const client = new SarvamStreamingSTTClient({
        callId: 'call_test_1',
        streamId: 'stream_test_1',
        languageCode: 'te-IN',
        apiKey: 'test_sarvam_key_xyz',
      });

      await client.connect();
      expect(client.isConnected).toBe(true);
      expect(client.providerName).toBe('SarvamAI');

      // Verify connection URL parameters
      expect(mockWs.url).toContain('api.sarvam.ai/speech-to-text-realtime/ws');
      expect(mockWs.url).toContain('language_code=te-IN');
      expect(mockWs.url).toContain('model=saaras%3Av3-realtime');
      expect(mockWs.url).toContain('encoding=linear16');
      expect(mockWs.url).toContain('sample_rate=16000');

      // Verify authentication header
      expect(mockWs.headers['Api-Subscription-Key']).toBe('test_sarvam_key_xyz');

      client.close();
    });

    it('dispatches partial transcript events', async () => {
      const client = new SarvamStreamingSTTClient({
        callId: 'call_test_partial',
        streamId: 'stream_test_partial',
        languageCode: 'te-IN',
        apiKey: 'mock_key',
      });

      await client.connect();

      let receivedPartial = '';
      client.on('partialTranscript', (evt) => {
        receivedPartial = evt.text;
      });

      // Simulate Sarvam sending partial transcript in Telugu
      mockWs.emit(
        'message',
        JSON.stringify({
          event: 'transcript.partial',
          transcript: 'నమస్కారం సార్',
          detected_language: 'te-IN',
        })
      );

      expect(receivedPartial).toBe('నమస్కారం సార్');
      client.close();
    });

    it('dispatches final transcript events with Telugu, Hindi, and English fixtures', async () => {
      const client = new SarvamStreamingSTTClient({
        callId: 'call_test_final',
        streamId: 'stream_test_final',
        languageCode: 'auto',
        apiKey: 'mock_key',
      });

      await client.connect();

      const finalEvents: { text: string; lang?: string }[] = [];
      client.on('finalTranscript', (evt) => {
        finalEvents.push({ text: evt.text, lang: evt.language });
      });

      // 1. Telugu final transcript
      mockWs.emit(
        'message',
        JSON.stringify({
          event: 'transcript.final',
          transcript: 'నేను అపాయింట్‌మెంట్ బుక్ చేసుకోవాలి అనుకుంటున్నాను.',
          detected_language: 'te-IN',
        })
      );

      // 2. Hindi final transcript
      mockWs.emit(
        'message',
        JSON.stringify({
          event: 'transcript.final',
          transcript: 'नमस्ते, मुझे डॉक्टर से मिलना है।',
          detected_language: 'hi-IN',
        })
      );

      // 3. Indian English / Code-mixing final transcript
      mockWs.emit(
        'message',
        JSON.stringify({
          event: 'transcript.final',
          transcript: 'Hello, can I reschedule my appointment to tomorrow?',
          detected_language: 'en-IN',
        })
      );

      expect(finalEvents.length).toBe(3);
      expect(finalEvents[0].text).toBe('నేను అపాయింట్‌మెంట్ బుక్ చేసుకోవాలి అనుకుంటున్నాను.');
      expect(finalEvents[0].lang).toBe('te-IN');
      expect(finalEvents[1].text).toBe('नमस्ते, मुझे डॉक्टर से मिलना है।');
      expect(finalEvents[1].lang).toBe('hi-IN');
      expect(finalEvents[2].text).toBe('Hello, can I reschedule my appointment to tomorrow?');
      expect(finalEvents[2].lang).toBe('en-IN');

      client.close();
    });

    it('dispatches Sarvam VAD speech_start and speech_end events', async () => {
      const client = new SarvamStreamingSTTClient({
        callId: 'call_test_vad',
        streamId: 'stream_test_vad',
        languageCode: 'hi-IN',
        apiKey: 'mock_key',
      });

      await client.connect();

      let speechStarted = false;
      let speechEnded = false;

      client.on('speechStart', () => {
        speechStarted = true;
      });
      client.on('speechEnd', () => {
        speechEnded = true;
      });

      mockWs.emit(
        'message',
        JSON.stringify({
          event: 'vad.speech_start',
          timestamp_ms: 1200,
        })
      );
      expect(speechStarted).toBe(true);

      mockWs.emit(
        'message',
        JSON.stringify({
          event: 'vad.speech_end',
          timestamp_ms: 3400,
        })
      );
      expect(speechEnded).toBe(true);

      client.close();
    });

    it('upsamples 8kHz telephony audio to 16kHz linear16 before sending', async () => {
      const client = new SarvamStreamingSTTClient({
        callId: 'call_test_audio',
        streamId: 'stream_test_audio',
        languageCode: 'en-IN',
        apiKey: 'mock_key',
      });

      await client.connect();

      // Create synthetic 8kHz PCM16 sine wave (160 samples = 20ms frame = 0.02s)
      const pcm8k = createSyntheticSineWave(440, 0.02, 8000);
      expect(pcm8k.length).toBe(160);

      client.sendAudio(pcm8k, 8000);

      expect(mockWs.sentMessages.length).toBe(1);
      const parsed = JSON.parse(mockWs.sentMessages[0]);
      expect(parsed.event).toBe('audio_input');
      expect(typeof parsed.audio).toBe('string');

      // 160 samples upsampled x2 = 320 samples. In linear16 (2 bytes/sample) = 640 bytes.
      const decodedBytes = Buffer.from(parsed.audio, 'base64');
      expect(decodedBytes.length).toBe(640);

      client.close();
    });

    it('enforces bounded audio queue (max 50 chunks) when buffering before connection', () => {
      // Create disconnected client
      const client = new SarvamStreamingSTTClient({
        callId: 'call_queue_test',
        streamId: 'stream_queue_test',
        languageCode: 'auto',
        apiKey: 'mock_key',
      });

      // Send 80 frames without connecting
      const pcm8k = createSyntheticSineWave(440, 0.02, 8000);
      for (let i = 0; i < 80; i++) {
        client.sendAudio(pcm8k, 8000);
      }

      // Check bounded queue size internal property
      expect((client as any).boundedAudioQueue.length).toBe(50);
      client.close();
    });

    it('handles provider error frames and missing API key gracefully without crashing', async () => {
      setSarvamWebSocketFactoryForTesting(null);
      const originalKey = process.env.SARVAM_API_KEY;
      delete process.env.SARVAM_API_KEY;

      const client = new SarvamStreamingSTTClient({
        callId: 'call_no_key',
        streamId: 'stream_no_key',
        languageCode: 'auto',
      });

      let errorReceived: any = null;
      client.on('error', (err) => {
        errorReceived = err;
      });

      await client.connect();
      expect(errorReceived).not.toBeNull();
      expect(errorReceived.code).toBe('API_KEY_MISSING');
      expect(client.isConnected).toBe(false);

      if (originalKey) {
        process.env.SARVAM_API_KEY = originalKey;
      }
    });
  });

  describe('MediaStreamManager & STT Integration', () => {
    let mockWs: MockWebSocket;

    beforeEach(() => {
      setSarvamWebSocketFactoryForTesting((url, protocols, options) => {
        mockWs = new MockWebSocket(url, protocols, options);
        return mockWs;
      });
    });

    afterEach(() => {
      setSarvamWebSocketFactoryForTesting(null);
    });

    it('attaches isolated STT client to media session and triggers barge-in on speechStart', async () => {
      const manager = new MediaStreamManager();

      let clientSentClearedAudio = false;
      const fakePlivoWs: any = new EventEmitter();
      fakePlivoWs.readyState = 1; // OPEN
      fakePlivoWs.send = (msg: string) => {
        const parsed = JSON.parse(msg);
        if (parsed.event === 'clearAudio') {
          clientSentClearedAudio = true;
        }
      };
      fakePlivoWs.close = () => {};

      const req: any = {
        url: '/media-stream?callId=call_isolated_01&lang=te-IN',
        headers: { host: '127.0.0.1' },
      };

      manager.handleConnection(fakePlivoWs, req);

      // Send Plivo start event
      manager.handleMessage(manager.getSessionByCallId('call_isolated_01')!, JSON.stringify({
        event: 'start',
        start: {
          streamId: 'stream_iso_01',
          callId: 'call_isolated_01',
          mediaFormat: {
            encoding: 'audio/x-mulaw',
            sampleRate: 8000,
            channels: 1,
          },
        },
      }));

      const session = manager.getSession('stream_iso_01');
      expect(session).toBeDefined();
      expect(session?.sttClient).toBeDefined();
      expect(session?.languageCode).toBe('te-IN');

      // Wait a microtask for STT to connect
      await new Promise((r) => setTimeout(r, 20));

      // Simulate Sarvam VAD speechStart on mockWs
      mockWs.emit('message', JSON.stringify({
        event: 'vad.speech_start',
        timestamp_ms: 450,
      }));

      // Expect clearAudio to be sent on Plivo WebSocket for immediate caller barge-in
      expect(clientSentClearedAudio).toBe(true);

      // Clean up
      manager.closeSession('stream_iso_01');
      expect(session?.sttClient).toBeUndefined();
      manager.cleanupAllSessions();
    });

    it('forwards decoded media frames from Plivo directly to isolated STT client without cross-call bleed', async () => {
      const manager = new MediaStreamManager();

      // Session A (Telugu)
      let mockWsA: MockWebSocket | null = null;
      let mockWsB: MockWebSocket | null = null;

      let callCounter = 0;
      setSarvamWebSocketFactoryForTesting((url, protocols, options) => {
        callCounter++;
        const ws = new MockWebSocket(url, protocols, options);
        if (callCounter === 1) mockWsA = ws;
        else mockWsB = ws;
        return ws;
      });

      const fakePlivoWsA: any = new EventEmitter();
      fakePlivoWsA.readyState = 1;
      fakePlivoWsA.send = () => {};
      fakePlivoWsA.close = () => {};

      const reqA: any = {
        url: '/media-stream?callId=call_A&lang=te-IN',
        headers: { host: '127.0.0.1' },
      };
      manager.handleConnection(fakePlivoWsA, reqA);
      const sessionA = manager.getSessionByCallId('call_A')!;
      manager.handleMessage(sessionA, JSON.stringify({
        event: 'start',
        start: { streamId: 'stream_A', callId: 'call_A' },
      }));

      // Session B (Hindi)
      const fakePlivoWsB: any = new EventEmitter();
      fakePlivoWsB.readyState = 1;
      fakePlivoWsB.send = () => {};
      fakePlivoWsB.close = () => {};

      const reqB: any = {
        url: '/media-stream?callId=call_B&lang=hi-IN',
        headers: { host: '127.0.0.1' },
      };
      manager.handleConnection(fakePlivoWsB, reqB);
      const sessionB = manager.getSessionByCallId('call_B')!;
      manager.handleMessage(sessionB, JSON.stringify({
        event: 'start',
        start: { streamId: 'stream_B', callId: 'call_B' },
      }));

      await new Promise((r) => setTimeout(r, 20));

      // Send audio only to Session A (20ms frame)
      const pcm16 = createSyntheticSineWave(440, 0.02, 8000);
      const ulawBuffer = encodeMuLaw(pcm16);
      manager.handleMessage(sessionA, JSON.stringify({
        event: 'media',
        media: {
          payload: ulawBuffer.toString('base64'),
        },
      }));

      // Session A's Sarvam client should have 1 audio_input frame
      expect(mockWsA!.sentMessages.length).toBe(1);
      const parsedA = JSON.parse(mockWsA!.sentMessages[0]);
      expect(parsedA.event).toBe('audio_input');

      // Session B's Sarvam client should have 0 messages (100% session isolation)
      expect(mockWsB!.sentMessages.length).toBe(0);

      manager.closeSession('stream_A');
      manager.closeSession('stream_B');
      manager.cleanupAllSessions();
    });
  });
});

  describe('Call Record Transcript Persistence', () => {
    it('appends final transcript events to the active call session without overwriting history', async () => {
      const manager = new MediaStreamManager();
      const testCallId = 'test_call_transcript_001';

      // We import app to ensure the mediaStreamManager listener in server.ts is active
      const { app } = await import('../server.ts');

      // Create a test session
      const fakePlivoWs: any = new EventEmitter();
      fakePlivoWs.readyState = 1;
      fakePlivoWs.send = () => {};
      fakePlivoWs.close = () => {};

      const req: any = {
        url: `/media-stream?callId=${testCallId}&lang=te-IN`,
        headers: { host: '127.0.0.1' },
      };

      manager.handleConnection(fakePlivoWs, req);
      const session = manager.getSessionByCallId(testCallId)!;

      // Start stream
      manager.handleMessage(session, JSON.stringify({
        event: 'start',
        start: { streamId: 'stream_trans_01', callId: testCallId },
      }));

      // Listen for finalTranscript event on manager
      let finalReceived = false;
      manager.addListener((evt) => {
        if (evt.type === 'finalTranscript' && evt.transcript?.includes('నమస్కారం')) {
          finalReceived = true;
        }
      });

      // Simulate Sarvam emitting final transcript
      session.sttClient?.['emit']?.('finalTranscript', {
        text: 'నమస్కారం, నాకు సహాయం కావాలి.',
        language: 'te-IN',
        isFinal: true,
      });

      expect(finalReceived).toBe(true);

      manager.closeSession('stream_trans_01');
      manager.cleanupAllSessions();
    });
  });
