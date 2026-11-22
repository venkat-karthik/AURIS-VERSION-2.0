/**
 * Universal Conversational LLM Interfaces
 * Decouples model providers (Gemini, local Ollama, Claude, etc.) from Auris telephony turn orchestration.
 */

export interface LLMMessageTurn {
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp?: string;
}

export interface GroundingKnowledgeItem {
  id: string;
  title: string;
  content: string;
}

export interface ConversationSessionConfig {
  callId: string;
  streamId: string;
  agentId?: string;
  agentName?: string;
  businessName?: string;
  language?: string; // e.g. 'Telugu', 'Hindi', 'English'
  languageCode?: string; // e.g. 'te-IN', 'hi-IN', 'en-IN', 'auto'
  instructions?: {
    role?: string;
    personality?: string;
    objectives?: string;
    rules?: string;
    greeting?: string;
    fallback?: string;
  };
  knowledgeItems?: GroundingKnowledgeItem[];
  customKnowledgeSnippet?: string;
  enableWebSearch?: boolean;
  maxHistoryTurns?: number; // default 10
  maxOutputTokens?: number; // default 150
  generationTimeoutMs?: number; // default 8000ms
}

export interface GenerationChunkEvent {
  textChunk: string;
  isSentenceBoundary: boolean;
  isFinal: boolean;
  model: string;
}

export interface StreamingLLMResponse {
  fullText: string;
  sentenceChunks: string[];
  latencyMs: number;
  interrupted: boolean;
  error?: string;
}

export interface StreamingLLMProvider {
  readonly providerName: string;
  generateStreamingTurn(
    prompt: string,
    history: LLMMessageTurn[],
    config: ConversationSessionConfig,
    onSentenceChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<StreamingLLMResponse>;
}
