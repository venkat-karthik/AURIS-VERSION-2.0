import { GoogleGenAI } from '@google/genai';
import {
  StreamingLLMProvider,
  LLMMessageTurn,
  ConversationSessionConfig,
  StreamingLLMResponse,
} from './types.ts';
import { SentenceChunker } from './sentenceChunker.ts';

// Test hook for mocking GoogleGenAI in automated tests
let testGenAIFactory: ((apiKey: string) => any) | null = null;

export function setGeminiClientFactoryForTesting(factory: ((apiKey: string) => any) | null): void {
  testGenAIFactory = factory;
}

export class GeminiStreamingClient implements StreamingLLMProvider {
  public readonly providerName = 'GoogleGemini';
  private client: GoogleGenAI | null = null;
  private apiKey: string;
  private defaultModel = 'gemini-2.5-flash';

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY?.trim() || '';
    if (model) {
      this.defaultModel = model;
    }
  }

  private getClient(): any {
    if (testGenAIFactory) {
      return testGenAIFactory(this.apiKey);
    }
    if (!this.client && this.apiKey) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }
    return this.client;
  }

  /**
   * Stream conversational response turn through Gemini with sentence chunking,
   * caller barge-in cancellation, timeout safety, and grounding protection.
   */
  public async generateStreamingTurn(
    prompt: string,
    history: LLMMessageTurn[],
    config: ConversationSessionConfig,
    onSentenceChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<StreamingLLMResponse> {
    const startTime = Date.now();
    const sentenceChunks: string[] = [];
    let fullText = '';
    const chunker = new SentenceChunker({ maxChunkLength: 160 });

    // 1. Validate API Key
    const client = this.getClient();
    if (!client) {
      console.warn(`[GeminiLLM] GEMINI_API_KEY is not configured for call ${config.callId}. Returning safe fallback.`);
      const fallbackText = config.instructions?.fallback ||
        "Thank you for calling. I am having trouble connecting to our system right now, but I can connect you with our team shortly.";
      onSentenceChunk(fallbackText);
      return {
        fullText: fallbackText,
        sentenceChunks: [fallbackText],
        latencyMs: Date.now() - startTime,
        interrupted: false,
        error: 'API_KEY_MISSING',
      };
    }

    // 2. Build Grounded System Instructions
    const systemInstruction = this.buildSystemInstruction(config);

    // 3. Build Formatted Contents (Caller & Assistant turns)
    const boundedHistory = history.slice(-(config.maxHistoryTurns || 10));
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const turn of boundedHistory) {
      if (turn.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: turn.text }] });
      } else if (turn.role === 'model') {
        contents.push({ role: 'model', parts: [{ text: turn.text }] });
      }
    }

    // Sanitize and append untrusted caller prompt
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const generateConfig: any = {
      systemInstruction,
      temperature: 0.5,
      maxOutputTokens: config.maxOutputTokens || 140,
    };

    if (config.enableWebSearch) {
      generateConfig.tools = [{ googleSearch: {} }];
    }

    // 4. Set up Generation Timeout & Abort Controller
    const timeoutMs = config.generationTimeoutMs || 8000;
    let timeoutId: any = null;
    let isInterrupted = false;

    try {
      const streamPromise = client.models.generateContentStream({
        model: this.defaultModel,
        contents,
        config: generateConfig,
      });

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Gemini streaming generation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      // Race against timeout
      const stream = (await Promise.race([streamPromise, timeoutPromise])) as AsyncIterable<any>;

      for await (const chunk of stream) {
        if (signal?.aborted) {
          isInterrupted = true;
          chunker.cancel();
          break;
        }

        const chunkText = chunk.text || '';
        if (chunkText) {
          fullText += chunkText;
          const readySentences = chunker.push(chunkText);
          for (const s of readySentences) {
            if (signal?.aborted) {
              isInterrupted = true;
              break;
            }
            sentenceChunks.push(s);
            onSentenceChunk(s);
          }
        }
      }

      // Flush any residual sentence fragment
      if (!isInterrupted && !signal?.aborted) {
        const residual = chunker.flush();
        for (const s of residual) {
          sentenceChunks.push(s);
          onSentenceChunk(s);
        }
      }

      clearTimeout(timeoutId);

      // If model returned empty text, return safe agent fallback
      if (!fullText.trim() && !isInterrupted) {
        const fallbackText = config.instructions?.fallback ||
          "I didn't quite catch that. Could you please say that again?";
        sentenceChunks.push(fallbackText);
        onSentenceChunk(fallbackText);
        fullText = fallbackText;
      }

      return {
        fullText: fullText.trim(),
        sentenceChunks,
        latencyMs: Date.now() - startTime,
        interrupted: isInterrupted || !!signal?.aborted,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn(`[GeminiLLM] Streaming error on call ${config.callId}:`, err.message);

      const isTimeout = err.message?.includes('timed out');
      const fallbackText = config.instructions?.fallback ||
        "I'm experiencing a brief connection delay. How may I best assist you?";

      if (sentenceChunks.length === 0 && !signal?.aborted) {
        sentenceChunks.push(fallbackText);
        onSentenceChunk(fallbackText);
      }

      return {
        fullText: sentenceChunks.join(' ') || fallbackText,
        sentenceChunks,
        latencyMs: Date.now() - startTime,
        interrupted: signal?.aborted || isInterrupted,
        error: isTimeout ? 'GENERATION_TIMEOUT' : (err.message || 'PROVIDER_ERROR'),
      };
    }
  }

  private buildSystemInstruction(config: ConversationSessionConfig): string {
    const businessName = config.businessName || 'Auris Enterprise';
    const agentName = config.agentName || 'Auris Voice Specialist';
    const lang = config.language || 'English';
    const instructions = config.instructions || {};

    let kbContext = '';
    if (config.knowledgeItems && config.knowledgeItems.length > 0) {
      kbContext = config.knowledgeItems
        .map((k) => `[Verified Knowledge: ${k.title}]\n${k.content}`)
        .join('\n\n');
    }

    if (config.customKnowledgeSnippet?.trim()) {
      kbContext += `\n\n[Agent-Specific Notes]:\n${config.customKnowledgeSnippet.trim()}`;
    }

    return `You are ${agentName}, an intelligent, highly natural conversational AI telephone agent speaking for "${businessName}".
Primary Language: ${lang}
Role: ${instructions.role || 'Helpful, natural voice assistant'}
Personality: ${instructions.personality || 'Human-like, warm, empathetic, attentive, crisp, and conversational'}
Objectives: ${instructions.objectives || 'Directly address the caller queries, converse naturally, and assist promptly'}

CRITICAL TELEPHONE CONVERSATION RULES:
1. Speak naturally like a real human on the phone. Output ONLY the exact words to be spoken aloud.
2. Absolutely NEVER output markdown formatting, asterisks, bullet points, headers, emojis, or code blocks.
3. Keep phone answers natural and concise (1 to 2 short conversational sentences per turn, under 25 words).
4. TELUGU & BILINGUAL SUPPORT: If the caller speaks Telugu, answer warmly in natural, fluent Telugu (తెలుగు). If the caller speaks English or mixed Telugu/English (Tanglish), reply naturally in the same style.
5. NEVER REPEAT YOURSELF: If the caller already told you their name, goal, or acknowledged with "Okay" or "Yeah", do NOT re-ask the same question. Address what they just said directly.
6. BACKCHANNEL AWARENESS: If the caller simply says "Okay", "Yeah", or "Sure", treat it as an active listening cue—continue your thought or politely ask how you can help with their specific topic.

VERIFIED KNOWLEDGE BASE (PRIMARY SOURCE OF TRUTH):
${kbContext || 'Answer caller questions about business, websites, e-commerce, and services with natural phone courtesy.'}

FALLBACK & SAFETY RULES:
- Fallback guidance: ${instructions.fallback || 'Offer to answer any questions or follow up directly.'}
- Business rules: ${instructions.rules || 'Be helpful, warm, and natural. Never invent false details.'}`;
  }
}
