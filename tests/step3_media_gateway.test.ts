import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
import http from 'http';
import { WebSocket } from 'ws';
import { app } from '../server.ts';
import {
  mediaStreamManager,
  MediaStreamManager,
} from '../src/services/mediaStreamManager.ts';
import {
  createStreamAuthToken,
  getValidatedWebSocketUrl,
} from '../src/services/telephonyService.ts';
import { encodeMuLaw, createSyntheticSineWave } from '../src/services/audioCodec.ts';

let server: http.Server;
let wsUrl: string;
const TEST_PORT = 3299;
const TEST_AUTH_TOKEN = 'secret_media_token_888';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.PORT = String(TEST_PORT);
  process.env.PLIVO_AUTH_TOKEN = TEST_AUTH_TOKEN;
  process.env.AURIS_PUBLIC_URL = `http://127.0.0.1:${TEST_PORT}`;

  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, '127.0.0.1', () => {
      mediaStreamManager.attachToServer(server, '/media-stream');
      wsUrl = `ws://127.0.0.1:${TEST_PORT}/media-stream`;
      resolve();
    });
  });
});

afterAll(async () => {
  mediaStreamManager.cleanupAllSessions();
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('Auris 2.0 Media Gateway WebSocket Tests', () => {
  describe('WebSocket Upgrade & Authorization', () => {
    it('rejects connection with invalid auth token', async () => {
      const invalidUrl = `${wsUrl}?callId=call_123&token=invalid_tampered_token`;
      const ws = new WebSocket(invalidUrl);

      const rejected = await new Promise<boolean>((resolve) => {
        ws.on('error', () => resolve(true));
        ws.on('unexpected-response', (req, res) => {
          if (res.statusCode === 401) resolve(true);
        });
        ws.on('open', () => {
          ws.close();
          resolve(false);
        });
      });

      expect(rejected).toBe(true);
    });

    it('successfully connects when valid auth token is provided', async () => {
      const callId = `call_test_${Date.now()}`;
      const token = createStreamAuthToken(callId);
      const authedUrl = `${wsUrl}?callId=${callId}&token=${token}`;

      const ws = new WebSocket(authedUrl);
      const opened = await new Promise<boolean>((resolve) => {
        ws.on('open', () => resolve(true));
        ws.on('error', () => resolve(false));
      });

      expect(opened).toBe(true);
      ws.close();
    });
  });

  describe('Plivo Protocol Event Handlers', () => {
    let ws: WebSocket;
    const streamId = `stream_${Date.now()}`;
    const callId = `call_${Date.now()}`;

    beforeEach(async () => {
      const token = createStreamAuthToken(callId);
      const url = `${wsUrl}?callId=${callId}&token=${token}`;
      ws = new WebSocket(url);
      await new Promise<void>((resolve) => ws.on('open', () => resolve()));
    });

    afterEach(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      mediaStreamManager.closeSession(streamId);
    });

    it('processes "start" event and stores session metadata', async () => {
      const startPayload = {
        event: 'start',
        sequenceNumber: 1,
        start: {
          streamId,
          callId,
          accountSid: 'MAMOCK_ACCOUNT',
          mediaFormat: {
            encoding: 'audio/x-mulaw',
            sampleRate: 8000,
            channels: 1,
          },
        },
      };

      ws.send(JSON.stringify(startPayload));

      // Wait brief tick for processing
      await new Promise((r) => setTimeout(r, 20));

      const session = mediaStreamManager.getSession(streamId);
      expect(session).toBeDefined();
      expect(session?.isStarted).toBe(true);
      expect(session?.callId).toBe(callId);
      expect(session?.mediaFormat.encoding).toBe('audio/x-mulaw');
      expect(session?.mediaFormat.sampleRate).toBe(8000);

      // Verify lookup by callId
      const sessionByCall = mediaStreamManager.getSessionByCallId(callId);
      expect(sessionByCall?.streamId).toBe(streamId);
    });

    it('handles duplicate "start" event idempotently without error', async () => {
      const startPayload = {
        event: 'start',
        start: { streamId, callId },
      };

      ws.send(JSON.stringify(startPayload));
      await new Promise((r) => setTimeout(r, 10));
      // Send duplicate
      ws.send(JSON.stringify(startPayload));
      await new Promise((r) => setTimeout(r, 10));

      const session = mediaStreamManager.getSession(streamId);
      expect(session).toBeDefined();
      expect(session?.isStarted).toBe(true);
    });

    it('processes "media" event, decodes μ-law audio and updates session metrics', async () => {
      // 1. Send start
      ws.send(JSON.stringify({ event: 'start', start: { streamId, callId } }));
      await new Promise((r) => setTimeout(r, 10));

      // 2. Generate 20ms of 440Hz test audio (160 samples at 8kHz)
      const pcm20ms = createSyntheticSineWave(440, 0.02, 8000);
      const ulawBuffer = encodeMuLaw(pcm20ms);
      const payloadBase64 = ulawBuffer.toString('base64');

      let receivedPcm: Int16Array | undefined;
      const removeListener = mediaStreamManager.addListener((evt) => {
        if (evt.type === 'media' && evt.session.streamId === streamId) {
          receivedPcm = evt.pcm16;
        }
      });

      // 3. Send media frame
      ws.send(JSON.stringify({
        event: 'media',
        sequenceNumber: 2,
        streamId,
        media: {
          payload: payloadBase64,
          track: 'inbound',
          chunk: 1,
        },
      }));

      await new Promise((r) => setTimeout(r, 20));
      removeListener();

      const session = mediaStreamManager.getSession(streamId);
      expect(session?.inboundMediaChunks).toBe(1);
      expect(session?.inboundBytes).toBe(ulawBuffer.length);
      expect(receivedPcm).toBeDefined();
      expect(receivedPcm?.length).toBe(pcm20ms.length);
    });

    it('maintains bounded audio queue under high volume', async () => {
      ws.send(JSON.stringify({ event: 'start', start: { streamId, callId } }));
      await new Promise((r) => setTimeout(r, 10));

      const smallBuffer = Buffer.alloc(160, 0xff);
      const payloadBase64 = smallBuffer.toString('base64');

      // Send 60 frames (exceeding default limit of 50)
      for (let i = 0; i < 60; i++) {
        ws.send(JSON.stringify({
          event: 'media',
          media: { payload: payloadBase64 },
        }));
      }

      await new Promise((r) => setTimeout(r, 50));

      const session = mediaStreamManager.getSession(streamId);
      expect(session?.inboundMediaChunks).toBe(60);
      // Verify audioBufferQueue is capped to maxQueueSize (50) to prevent unbounded memory growth
      expect(session?.audioBufferQueue.length).toBeLessThanOrEqual(50);
    });

    it('drops oversized media payloads (>8KB)', async () => {
      ws.send(JSON.stringify({ event: 'start', start: { streamId, callId } }));
      await new Promise((r) => setTimeout(r, 10));

      const oversizedPayload = 'A'.repeat(10000); // 10KB
      ws.send(JSON.stringify({
        event: 'media',
        media: { payload: oversizedPayload },
      }));

      await new Promise((r) => setTimeout(r, 20));

      const session = mediaStreamManager.getSession(streamId);
      expect(session?.inboundMediaChunks).toBe(0); // dropped
    });

    it('processes "dtmf" event and extracts digit', async () => {
      ws.send(JSON.stringify({ event: 'start', start: { streamId, callId } }));
      await new Promise((r) => setTimeout(r, 10));

      let capturedDigit = '';
      const removeListener = mediaStreamManager.addListener((evt) => {
        if (evt.type === 'dtmf' && evt.session.streamId === streamId) {
          capturedDigit = evt.dtmfDigit || '';
        }
      });

      ws.send(JSON.stringify({
        event: 'dtmf',
        streamId,
        dtmf: { digit: '5' },
      }));

      await new Promise((r) => setTimeout(r, 20));
      removeListener();

      expect(capturedDigit).toBe('5');
    });

    it('processes "stop" event and closes session cleanly', async () => {
      ws.send(JSON.stringify({ event: 'start', start: { streamId, callId } }));
      await new Promise((r) => setTimeout(r, 10));

      ws.send(JSON.stringify({
        event: 'stop',
        streamId,
      }));

      await new Promise((r) => setTimeout(r, 20));

      const session = mediaStreamManager.getSession(streamId);
      expect(session).toBeUndefined(); // Cleaned up
    });

    it('handles malformed JSON frames safely without crashing server', async () => {
      ws.send('not_valid_json{{{');
      await new Promise((r) => setTimeout(r, 20));

      // Server should still be healthy
      expect(ws.readyState).toBe(WebSocket.OPEN);
    });
  });

  describe('Outbound Playback Control to Provider', () => {
    let ws: WebSocket;
    const streamId = `outbound_stream_${Date.now()}`;
    const callId = `outbound_call_${Date.now()}`;

    beforeEach(async () => {
      const token = createStreamAuthToken(callId);
      const url = `${wsUrl}?callId=${callId}&token=${token}`;
      ws = new WebSocket(url);
      await new Promise<void>((resolve) => ws.on('open', () => resolve()));

      ws.send(JSON.stringify({
        event: 'start',
        start: { streamId, callId },
      }));
      await new Promise((r) => setTimeout(r, 15));
    });

    afterEach(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      mediaStreamManager.closeSession(streamId);
    });

    it('sends "playAudio" frame matching Plivo specifications', async () => {
      const testAudio = Buffer.from([0xff, 0xce, 0x4e, 0x80]);

      const receivedPromise = new Promise<any>((resolve) => {
        ws.on('message', (msg) => {
          const parsed = JSON.parse(msg.toString());
          if (parsed.event === 'playAudio') {
            resolve(parsed);
          }
        });
      });

      const sent = mediaStreamManager.playAudioToStream(streamId, testAudio);
      expect(sent).toBe(true);

      const frame = await receivedPromise;
      expect(frame.event).toBe('playAudio');
      expect(frame.media.contentType).toBe('audio/x-mulaw');
      expect(frame.media.sampleRate).toBe(8000);
      expect(frame.media.payload).toBe(testAudio.toString('base64'));

      const session = mediaStreamManager.getSession(streamId);
      expect(session?.outboundMediaChunks).toBe(1);
      expect(session?.outboundBytes).toBe(testAudio.length);
    });

    it('sends "clearAudio" frame for real-time barge-in', async () => {
      const receivedPromise = new Promise<any>((resolve) => {
        ws.on('message', (msg) => {
          const parsed = JSON.parse(msg.toString());
          if (parsed.event === 'clearAudio') {
            resolve(parsed);
          }
        });
      });

      const sent = mediaStreamManager.clearAudioStream(streamId);
      expect(sent).toBe(true);

      const frame = await receivedPromise;
      expect(frame.event).toBe('clearAudio');
      expect(frame.streamId).toBe(streamId);
    });

    it('sends "checkpoint" frame to track playback queue progress', async () => {
      const receivedPromise = new Promise<any>((resolve) => {
        ws.on('message', (msg) => {
          const parsed = JSON.parse(msg.toString());
          if (parsed.event === 'checkpoint') {
            resolve(parsed);
          }
        });
      });

      const sent = mediaStreamManager.sendCheckpoint(streamId, 'sentence_1_complete');
      expect(sent).toBe(true);

      const frame = await receivedPromise;
      expect(frame.event).toBe('checkpoint');
      expect(frame.name).toBe('sentence_1_complete');
    });
  });
});
