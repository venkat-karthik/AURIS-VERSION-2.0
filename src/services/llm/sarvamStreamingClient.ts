import {
  StreamingLLMProvider,
  LLMMessageTurn,
  ConversationSessionConfig,
  StreamingLLMResponse,
} from './types.ts';
import { SentenceChunker } from './sentenceChunker.ts';

export class SarvamStreamingLLMClient implements StreamingLLMProvider {
  public readonly providerName = 'Sarvam105B';
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model: string = 'sarvam-105b-conversations') {
    this.apiKey = apiKey || process.env.SARVAM_API_KEY?.trim() || '';
    this.model = model;
  }

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

    if (!this.apiKey) {
      console.warn(`[SarvamLLM] SARVAM_API_KEY is not configured for call ${config.callId}.`);
      const fallback = config.instructions?.fallback || 'నమస్కారం, దయచేసి ఒక్క క్షణం ఆగండి.';
      onSentenceChunk(fallback);
      return {
        fullText: fallback,
        sentenceChunks: [fallback],
        latencyMs: Date.now() - startTime,
        interrupted: false,
        error: 'SARVAM_API_KEY_MISSING',
      };
    }

    // Build system message with persona, instructions, and grounding
    let systemInstruction = `You are ${config.agentName || 'Auris Voice Assistant'}, a warm, intelligent AI voice employee for ${config.businessName || 'Auris'}.
Primary Language: ${config.language || 'Telugu & English'}.
Rules:
1. Always respond naturally and conversationally, suitable for spoken telephone dialogue.
2. If caller speaks Telugu, answer in fluent, warm Telugu (తెలుగు). If caller speaks English or mixed (Tanglish), reply naturally.
3. Keep phone answers brief and conversational (1 to 2 short sentences, under 25 words).
4. Never repeat a question or greeting that has already been asked or acknowledged. Directly address what the caller said.
5. If the caller says "Okay" or "Yeah", treat it as an acknowledgment and proceed smoothly with their topic.`;

    if (config.instructions?.role) {
      systemInstruction += `\nRole: ${config.instructions.role}`;
    }
    if (config.instructions?.objectives) {
      systemInstruction += `\nObjectives: ${config.instructions.objectives}`;
    }
    if (config.instructions?.rules) {
      systemInstruction += `\nRules: ${config.instructions.rules}`;
    }
    if (config.knowledgeItems && config.knowledgeItems.length > 0) {
      systemInstruction += `\nKnowledge Base:\n` + config.knowledgeItems.map((k) => `[${k.title}]: ${k.content}`).join('\n');
    }

    const messages = [
      { role: 'system', content: systemInstruction },
      ...history.slice(-8).map((h) => ({
        role: h.role === 'model' ? 'assistant' : h.role,
        content: h.text,
      })),
      { role: 'user', content: prompt },
    ];

    try {
      const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'api-subscription-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: true,
          max_tokens: config.maxOutputTokens || 150,
          temperature: 0.3,
        }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sarvam chat completion failed (${response.status}): ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Sarvam chat completion returned no response body.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        if (signal?.aborted) {
          return {
            fullText,
            sentenceChunks,
            latencyMs: Date.now() - startTime,
            interrupted: true,
          };
        }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const jsonStr = trimmed.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              const readySentences = chunker.push(delta);
              for (const s of readySentences) {
                if (signal?.aborted) break;
                sentenceChunks.push(s);
                onSentenceChunk(s);
              }
            }
          } catch {
            // Ignore parse errors on malformed chunks
          }
        }
      }

      // Flush any remaining buffered text
      const remaining = chunker.flush();
      for (const s of remaining) {
        if (!signal?.aborted) {
          sentenceChunks.push(s);
          onSentenceChunk(s);
        }
      }

      return {
        fullText,
        sentenceChunks,
        latencyMs: Date.now() - startTime,
        interrupted: false,
      };
    } catch (err: any) {
      if (signal?.aborted || err.name === 'AbortError') {
        return {
          fullText,
          sentenceChunks,
          latencyMs: Date.now() - startTime,
          interrupted: true,
        };
      }
      return {
        fullText,
        sentenceChunks,
        latencyMs: Date.now() - startTime,
        interrupted: false,
        error: err.message,
      };
    }
  }
}

