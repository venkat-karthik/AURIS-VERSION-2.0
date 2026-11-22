import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { SentenceChunker } from '../src/services/llm/sentenceChunker.ts';
import {
  GeminiStreamingClient,
  setGeminiClientFactoryForTesting,
} from '../src/services/llm/geminiStreamingClient.ts';
import {
  ConversationManager,
  ActiveConversationSession,
} from '../src/services/llm/conversationManager.ts';
import {
  StreamingLLMProvider,
  ConversationSessionConfig,
  LLMMessageTurn,
  StreamingLLMResponse,
} from '../src/services/llm/types.ts';

describe('Auris 2.0 - Step 5: Gemini Conversational Engine', () => {
  describe('SentenceChunker Unit Tests', () => {
    it('splits complete sentences on standard punctuation (. ! ?)', () => {
      const chunker = new SentenceChunker();

      const chunks1 = chunker.push('Hello! How can ');
      expect(chunks1).toEqual(['Hello!']);

      const chunks2 = chunker.push('I help you today? Please let me know.');
      expect(chunks2).toEqual(['How can I help you today?', 'Please let me know.']);

      const residual = chunker.flush();
      expect(residual).toEqual([]);
    });

    it('handles Hindi purna viram (।) and Telugu punctuation', () => {
      const chunker = new SentenceChunker();

      const chunks1 = chunker.push('नमस्ते। आप कैसे हैं? ');
      expect(chunks1).toEqual(['नमस्ते।', 'आप कैसे हैं?']);

      const chunks2 = chunker.push('నమస్కారం! నేను మీకు సహాయం చేయగలను. ధన్యవాదాలు.');
      expect(chunks2).toEqual(['నమస్కారం!', 'నేను మీకు సహాయం చేయగలను.', 'ధన్యవాదాలు.']);
    });

    it('ignores abbreviations like Dr., Mr., Rs., etc. without splitting premature chunks', () => {
      const chunker = new SentenceChunker();

      const chunks1 = chunker.push('Please meet Dr. Sharma at 10 AM. He will review your case.');
      expect(chunks1).toEqual([
        'Please meet Dr. Sharma at 10 AM.',
        'He will review your case.',
      ]);

      const chunks2 = chunker.push('The consultation fee is Rs. 500 only. Can I book this?');
      expect(chunks2).toEqual([
        'The consultation fee is Rs. 500 only.',
        'Can I book this?',
      ]);
    });

    it('handles decimal numbers like 3.5 or $49.99 without splitting', () => {
      const chunker = new SentenceChunker();
      const chunks = chunker.push('The total plan cost is $39.99 per month. Would you like to proceed?');
      expect(chunks).toEqual([
        'The total plan cost is $39.99 per month.',
        'Would you like to proceed?',
      ]);
    });

    it('flushes incomplete residual text at the end of stream', () => {
      const chunker = new SentenceChunker();
      chunker.push('Our clinic is open right now');
      const residual = chunker.flush();
      expect(residual).toEqual(['Our clinic is open right now']);
    });

    it('discards all buffered text and cancels on caller interruption', () => {
      const chunker = new SentenceChunker();
      chunker.push('I am starting to say something very important and');
      chunker.cancel();
      expect(chunker.flush()).toEqual([]);
      expect(chunker.push(' more words')).toEqual([]);
    });

    it('breaks run-on sentences exceeding maxChunkLength on clause or word boundaries', () => {
      const chunker = new SentenceChunker({ maxChunkLength: 60 });
      const longText = 'We provide comprehensive voice AI capabilities for modern clinics, including instant appointment scheduling and customer inquiry handling';
      const chunks = chunker.push(longText);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].length).toBeLessThanOrEqual(70);
    });
  });

  describe('GeminiStreamingClient Tests (Mocked SDK)', () => {
    afterEach(() => {
      setGeminiClientFactoryForTesting(null);
    });

    it('streams response chunks and emits complete sentences', async () => {
      // Mock stream chunks
      async function* mockStream() {
        yield { text: 'Hello! ' };
        yield { text: 'Welcome to ' };
        yield { text: 'Elite Dental Clinic. ' };
        yield { text: 'How may I assist you today?' };
      }

      setGeminiClientFactoryForTesting(() => ({
        models: {
          generateContentStream: async () => mockStream(),
        },
      }));

      const client = new GeminiStreamingClient('mock_key');
      const emittedChunks: string[] = [];

      const result = await client.generateStreamingTurn(
        'Hi there',
        [],
        {
          callId: 'call_1',
          streamId: 'stream_1',
          agentName: 'Ava',
          businessName: 'Elite Dental Clinic',
        },
        (chunk) => emittedChunks.push(chunk)
      );

      expect(emittedChunks).toEqual([
        'Hello!',
        'Welcome to Elite Dental Clinic.',
        'How may I assist you today?',
      ]);
      expect(result.fullText).toBe('Hello! Welcome to Elite Dental Clinic. How may I assist you today?');
      expect(result.interrupted).toBe(false);
    });

    it('aborts streaming turn immediately when AbortSignal fires (caller barge-in)', async () => {
      const abortController = new AbortController();

      async function* mockStream() {
        yield { text: 'First sentence here. ' };
        // Trigger abort before second sentence finishes
        abortController.abort();
        yield { text: 'Second sentence that should be cancelled.' };
      }

      setGeminiClientFactoryForTesting(() => ({
        models: {
          generateContentStream: async () => mockStream(),
        },
      }));

      const client = new GeminiStreamingClient('mock_key');
      const emittedChunks: string[] = [];

      const result = await client.generateStreamingTurn(
        'What are your hours?',
        [],
        {
          callId: 'call_barge_in',
          streamId: 'stream_barge_in',
        },
        (chunk) => emittedChunks.push(chunk),
        abortController.signal
      );

      expect(result.interrupted).toBe(true);
      expect(emittedChunks).toEqual(['First sentence here.']);
    });

    it('handles provider timeout and returns safe fallback response', async () => {
      // Mock stream that hangs forever
      setGeminiClientFactoryForTesting(() => ({
        models: {
          generateContentStream: () =>
            new Promise((resolve) => setTimeout(resolve, 50000)),
        },
      }));

      const client = new GeminiStreamingClient('mock_key');
      const emittedChunks: string[] = [];

      const result = await client.generateStreamingTurn(
        'Hello?',
        [],
        {
          callId: 'call_timeout',
          streamId: 'stream_timeout',
          generationTimeoutMs: 100, // 100ms test timeout
          instructions: {
            fallback: 'Please hold on while I check that for you.',
          },
        },
        (chunk) => emittedChunks.push(chunk)
      );

      expect(result.error).toBe('GENERATION_TIMEOUT');
      expect(emittedChunks).toContain('Please hold on while I check that for you.');
    });

    it('returns safe fallback when GEMINI_API_KEY is missing without crashing server', async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const client = new GeminiStreamingClient('');
      const emittedChunks: string[] = [];

      const result = await client.generateStreamingTurn(
        'Hello',
        [],
        {
          callId: 'call_no_key',
          streamId: 'stream_no_key',
          instructions: {
            fallback: 'Our lines are busy. We will call you back shortly.',
          },
        },
        (chunk) => emittedChunks.push(chunk)
      );

      expect(result.error).toBe('API_KEY_MISSING');
      expect(emittedChunks).toContain('Our lines are busy. We will call you back shortly.');

      if (originalKey) {
        process.env.GEMINI_API_KEY = originalKey;
      }
    });
  });

  describe('ConversationManager Session Isolation & Deduplication', () => {
    let mockLLM: StreamingLLMProvider;

    beforeEach(() => {
      mockLLM = {
        providerName: 'MockLLM',
        generateStreamingTurn: async (prompt, history, config, onChunk, signal) => {
          const reply = `Response to "${prompt}" in ${config.language || 'English'}.`;
          onChunk(reply);
          return {
            fullText: reply,
            sentenceChunks: [reply],
            latencyMs: 15,
            interrupted: false,
          };
        },
      };
    });

    it('registers session and generates contextually grounded responses', async () => {
      const manager = new ConversationManager(mockLLM);

      manager.registerSession({
        callId: 'call_mgr_01',
        streamId: 'stream_mgr_01',
        agentName: 'Priya',
        language: 'Telugu',
        instructions: {
          role: 'Telugu Clinic Receptionist',
        },
      });

      const session = manager.getSession('call_mgr_01');
      expect(session).toBeDefined();
      expect(session?.config.agentName).toBe('Priya');

      const response = await manager.handleFinalTranscript('call_mgr_01', 'నమస్కారం');
      expect(response?.fullText).toContain('Response to "నమస్కారం" in Telugu.');

      // Check conversation history has 2 turns (caller + model)
      expect(session?.history.length).toBe(2);
      expect(session?.history[0].role).toBe('user');
      expect(session?.history[0].text).toBe('నమస్కారం');
      expect(session?.history[1].role).toBe('model');

      manager.closeSession('call_mgr_01');
    });

    it('deduplicates identical final transcripts arriving within deduplication window', async () => {
      let callCount = 0;
      const countingLLM: StreamingLLMProvider = {
        providerName: 'CountingLLM',
        generateStreamingTurn: async (prompt, history, config, onChunk) => {
          callCount++;
          onChunk('Okay.');
          return {
            fullText: 'Okay.',
            sentenceChunks: ['Okay.'],
            latencyMs: 10,
            interrupted: false,
          };
        },
      };

      const manager = new ConversationManager(countingLLM);
      manager.registerSession({
        callId: 'call_dedup_01',
        streamId: 'stream_dedup_01',
      });

      // First final transcript
      const res1 = await manager.handleFinalTranscript('call_dedup_01', 'Hello');
      expect(res1).not.toBeNull();
      expect(callCount).toBe(1);

      // Duplicate final transcript arriving 50ms later
      const res2 = await manager.handleFinalTranscript('call_dedup_01', 'Hello');
      expect(res2).toBeNull(); // Should be dropped as duplicate
      expect(callCount).toBe(1); // LLM should NOT have been invoked again

      manager.closeSession('call_dedup_01');
    });

    it('strictly isolates conversation history and state between different call sessions', async () => {
      const manager = new ConversationManager(mockLLM);

      // Call A: Hyderabad lead inquiring about villa
      manager.registerSession({
        callId: 'call_A',
        streamId: 'stream_A',
        agentName: 'Agent A',
        language: 'Telugu',
      });

      // Call B: Bengaluru lead inquiring about apartment
      manager.registerSession({
        callId: 'call_B',
        streamId: 'stream_B',
        agentName: 'Agent B',
        language: 'Hindi',
      });

      await manager.handleFinalTranscript('call_A', 'విల్లా ధర ఎంత?');
      await manager.handleFinalTranscript('call_B', 'फ्लैट की कीमत क्या है?');

      const sessionA = manager.getSession('call_A')!;
      const sessionB = manager.getSession('call_B')!;

      // Session A history should only contain Telugu villa turn
      expect(sessionA.history.length).toBe(2);
      expect(sessionA.history[0].text).toBe('విల్లా ధర ఎంత?');
      expect(sessionA.history.some((t) => t.text.includes('फ्लैट'))).toBe(false);

      // Session B history should only contain Hindi flat turn
      expect(sessionB.history.length).toBe(2);
      expect(sessionB.history[0].text).toBe('फ्लैट की कीमत क्या है?');
      expect(sessionB.history.some((t) => t.text.includes('విల్లా'))).toBe(false);

      manager.closeSession('call_A');
      manager.closeSession('call_B');
    });

    it('enforces bounded conversation history (max 14 turns) to prevent memory leak', async () => {
      const manager = new ConversationManager(mockLLM);
      manager.registerSession({
        callId: 'call_bounded',
        streamId: 'stream_bounded',
      });

      // Push 10 back-and-forth turns (20 total turns)
      for (let i = 0; i < 10; i++) {
        await manager.handleFinalTranscript('call_bounded', `Turn number ${i}`);
      }

      const session = manager.getSession('call_bounded')!;
      expect(session.history.length).toBeLessThanOrEqual(14);

      manager.closeSession('call_bounded');
    });

    it('interrupts generation when caller speech starts (barge-in)', async () => {
      let turnInterrupted = false;
      const slowLLM: StreamingLLMProvider = {
        providerName: 'SlowLLM',
        generateStreamingTurn: async (prompt, history, config, onChunk, signal) => {
          return new Promise((resolve) => {
            const timer = setTimeout(() => {
              onChunk('Finished response');
              resolve({
                fullText: 'Finished response',
                sentenceChunks: ['Finished response'],
                latencyMs: 100,
                interrupted: false,
              });
            }, 300);

            signal?.addEventListener('abort', () => {
              clearTimeout(timer);
              turnInterrupted = true;
              resolve({
                fullText: '',
                sentenceChunks: [],
                latencyMs: 20,
                interrupted: true,
              });
            });
          });
        },
      };

      const manager = new ConversationManager(slowLLM);
      manager.registerSession({
        callId: 'call_interruption_test',
        streamId: 'stream_interruption_test',
      });

      // Start turn generation asynchronously
      const promise = manager.handleFinalTranscript('call_interruption_test', 'Tell me a story');

      // Caller barge-in after 20ms
      await new Promise((r) => setTimeout(r, 20));
      const wasInterrupted = manager.interruptGeneration('call_interruption_test');

      expect(wasInterrupted).toBe(true);
      await promise;
      expect(turnInterrupted).toBe(true);

      manager.closeSession('call_interruption_test');
    });
  });
});
