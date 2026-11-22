import {
  StreamingLLMProvider,
  LLMMessageTurn,
  ConversationSessionConfig,
  StreamingLLMResponse,
} from './types.ts';
import { GeminiStreamingClient } from './geminiStreamingClient.ts';
import { SarvamStreamingLLMClient } from './sarvamStreamingClient.ts';

export interface ActiveConversationSession {
  callId: string;
  streamId: string;
  config: ConversationSessionConfig;
  history: LLMMessageTurn[];
  activeAbortController?: AbortController;
  isGenerating: boolean;
  lastProcessedTranscript: string;
  lastProcessedAt: number;
}

export type ConversationTurnListener = (event: {
  callId: string;
  streamId: string;
  type: 'chunk' | 'completed' | 'interrupted' | 'error';
  chunk?: string;
  fullResponse?: string;
  error?: string;
}) => void;

export class ConversationManager {
  private sessionsByCallId = new Map<string, ActiveConversationSession>();
  private sessionsByStreamId = new Map<string, ActiveConversationSession>();
  private llmProvider: StreamingLLMProvider;
  private listeners: ConversationTurnListener[] = [];
  private static readonly DEDUPLICATION_WINDOW_MS = 2500; // 2.5s window to ignore identical duplicate final transcripts

  constructor(llmProvider?: StreamingLLMProvider) {
    if (llmProvider) {
      this.llmProvider = llmProvider;
    } else if (process.env.GEMINI_API_KEY?.trim()) {
      this.llmProvider = new GeminiStreamingClient();
    } else if (process.env.SARVAM_API_KEY?.trim()) {
      this.llmProvider = new SarvamStreamingLLMClient();
    } else {
      this.llmProvider = new GeminiStreamingClient();
    }
  }

  /**
   * Register or initialize a call session with agent config and knowledge base
   */
  public registerSession(config: ConversationSessionConfig): ActiveConversationSession {
    const existing = this.sessionsByCallId.get(config.callId);
    if (existing) {
      existing.config = { ...existing.config, ...config };
      if (config.streamId) {
        this.sessionsByStreamId.set(config.streamId, existing);
      }
      return existing;
    }

    const session: ActiveConversationSession = {
      callId: config.callId,
      streamId: config.streamId,
      config,
      history: [],
      isGenerating: false,
      lastProcessedTranscript: '',
      lastProcessedAt: 0,
    };

    this.sessionsByCallId.set(config.callId, session);
    if (config.streamId) {
      this.sessionsByStreamId.set(config.streamId, session);
    }

    console.log(`[ConversationManager] Registered conversation session for Call: ${config.callId} (Agent: ${config.agentName || 'Default'})`);
    return session;
  }

  public aliasSession(primaryId: string, aliasId: string): void {
    const session = this.getSession(primaryId);
    if (session) {
      this.sessionsByCallId.set(aliasId, session);
      this.sessionsByStreamId.set(aliasId, session);
      if (aliasId.includes('-') && aliasId.length >= 32) {
        session.streamId = aliasId;
      }
    }
  }

  public getSession(callIdOrStreamId: string): ActiveConversationSession | undefined {
    return this.sessionsByCallId.get(callIdOrStreamId) || this.sessionsByStreamId.get(callIdOrStreamId);
  }

  /**
   * Process a genuine final transcript from STT
   */
  public async handleFinalTranscript(
    callIdOrStreamId: string,
    transcript: string,
    language?: string
  ): Promise<StreamingLLMResponse | null> {
    const session = this.getSession(callIdOrStreamId);
    if (!session) {
      console.warn(`[ConversationManager] Received final transcript for unknown session: ${callIdOrStreamId}`);
      return null;
    }

    const cleanTranscript = transcript.trim();
    if (!cleanTranscript) {
      return null;
    }

    // 1. Deduplicate identical final transcript repeats within window
    const now = Date.now();
    if (
      cleanTranscript.toLowerCase() === session.lastProcessedTranscript.toLowerCase() &&
      now - session.lastProcessedAt < ConversationManager.DEDUPLICATION_WINDOW_MS
    ) {
      console.log(`[ConversationManager] Ignored duplicate final transcript for call ${session.callId}: "${cleanTranscript}"`);
      return null;
    }

    session.lastProcessedTranscript = cleanTranscript;
    session.lastProcessedAt = now;

    // 2. Cancel any pending generation from previous turn
    this.interruptGeneration(session.callId);

    // 3. Append caller turn to isolated history
    session.history.push({
      role: 'user',
      text: cleanTranscript,
      timestamp: new Date().toISOString(),
    });

    // Enforce bounded history (retain max 14 turns)
    if (session.history.length > 14) {
      session.history = session.history.slice(-14);
    }

    // 4. Update language in config if detected
    if (language && !session.config.language) {
      session.config.language = language;
    }

    // 5. Create new AbortController for this turn
    const abortController = new AbortController();
    session.activeAbortController = abortController;
    session.isGenerating = true;

    try {
      const response = await this.llmProvider.generateStreamingTurn(
        cleanTranscript,
        session.history,
        session.config,
        (sentenceChunk) => {
          this.notifyListeners({
            callId: session.callId,
            streamId: session.streamId,
            type: 'chunk',
            chunk: sentenceChunk,
          });
        },
        abortController.signal
      );

      session.isGenerating = false;

      // Append assistant turn to history if not interrupted
      if (!response.interrupted && response.fullText) {
        session.history.push({
          role: 'model',
          text: response.fullText,
          timestamp: new Date().toISOString(),
        });

        // Enforce bounded history
        if (session.history.length > 14) {
          session.history = session.history.slice(-14);
        }

        this.notifyListeners({
          callId: session.callId,
          streamId: session.streamId,
          type: 'completed',
          fullResponse: response.fullText,
        });
      } else if (response.interrupted) {
        this.notifyListeners({
          callId: session.callId,
          streamId: session.streamId,
          type: 'interrupted',
        });
      }

      return response;
    } catch (err: any) {
      session.isGenerating = false;
      this.notifyListeners({
        callId: session.callId,
        streamId: session.streamId,
        type: 'error',
        error: err.message,
      });
      return null;
    }
  }

  /**
   * Interrupt active generation when caller speaks (barge-in)
   */
  public interruptGeneration(callIdOrStreamId: string): boolean {
    const session = this.getSession(callIdOrStreamId);
    if (!session || !session.isGenerating || !session.activeAbortController) {
      return false;
    }

    console.log(`[ConversationManager] Interrupting active Gemini generation for Call: ${session.callId}`);
    session.activeAbortController.abort();
    session.activeAbortController = undefined;
    session.isGenerating = false;

    this.notifyListeners({
      callId: session.callId,
      streamId: session.streamId,
      type: 'interrupted',
    });

    return true;
  }

  /**
   * Clean up and release conversation session
   */
  public closeSession(callIdOrStreamId: string): void {
    const session = this.getSession(callIdOrStreamId);
    if (!session) return;

    this.interruptGeneration(session.callId);
    session.history = []; // Release history memory

    this.sessionsByCallId.delete(session.callId);
    if (session.streamId) {
      this.sessionsByStreamId.delete(session.streamId);
    }
    console.log(`[ConversationManager] Closed conversation session for Call: ${session.callId}`);
  }

  public addListener(listener: ConversationTurnListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(event: {
    callId: string;
    streamId: string;
    type: 'chunk' | 'completed' | 'interrupted' | 'error';
    chunk?: string;
    fullResponse?: string;
    error?: string;
  }): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err: any) {
        console.warn('[ConversationManager] Listener error:', err.message);
      }
    }
  }

  public cleanupAll(): void {
    for (const callId of Array.from(this.sessionsByCallId.keys())) {
      this.closeSession(callId);
    }
  }
}

export const conversationManager = new ConversationManager();
