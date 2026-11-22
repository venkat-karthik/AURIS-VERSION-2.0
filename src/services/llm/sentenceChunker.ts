/**
 * Auris 2.0 Sentence Chunker
 * Emits complete, natural, speakable sentence chunks from incremental LLM stream tokens.
 *
 * Rules:
 * 1. Preserves sentence order.
 * 2. Avoids empty, whitespace-only, or punctuation-only chunks.
 * 3. Handles standard sentence terminators (. ! ? । ။), ellipsis (...), and abbreviations (e.g. Dr., Mr., Rs., Ph.D., vs., etc.) without premature splits.
 * 4. Flushes residual text when stream ends.
 * 5. Bounded chunk size: splits oversized run-on sentences on clauses (, ; :) or space boundaries if exceeding maxChunkLength.
 */

export interface SentenceChunkerOptions {
  maxChunkLength?: number; // e.g. 180 chars max to prevent TTS stutter
  minChunkLength?: number; // e.g. 6 chars min to avoid tiny single-word bursts
}

export class SentenceChunker {
  private buffer = '';
  private maxChunkLength: number;
  private minChunkLength: number;
  private isCancelled = false;

  // Common Indic & English abbreviations that should not split sentences
  private static readonly ABBREVIATIONS = new Set([
    'dr', 'mr', 'mrs', 'ms', 'prof', 'rs', 'vs', 'etc', 'eg', 'ie', 'approx', 'dept',
    'no', 'st', 'ave', 'rd', 'apt', 'ph', 'tel', 'inc', 'ltd', 'pvt', 'co', 'corp',
  ]);

  constructor(options: SentenceChunkerOptions = {}) {
    this.maxChunkLength = options.maxChunkLength || 180;
    this.minChunkLength = options.minChunkLength || 6;
  }

  /**
   * Append a token or text chunk from the LLM stream.
   * Returns any complete sentences ready for speech synthesis.
   */
  public push(token: string): string[] {
    if (this.isCancelled || !token) return [];

    this.buffer += token;
    const emittedChunks: string[] = [];

    while (this.buffer.length > 0) {
      const splitIdx = this.findNextSentenceEnd(this.buffer);

      if (splitIdx !== -1) {
        const sentence = this.buffer.slice(0, splitIdx + 1).trim();
        this.buffer = this.buffer.slice(splitIdx + 1);

        if (this.isValidChunk(sentence)) {
          emittedChunks.push(sentence);
        }
      } else if (this.buffer.length >= this.maxChunkLength) {
        // Run-on sentence protection: split on clause boundary (, ; :) or word boundary
        const clauseIdx = this.findClauseBoundary(this.buffer);
        if (clauseIdx !== -1) {
          const chunk = this.buffer.slice(0, clauseIdx + 1).trim();
          this.buffer = this.buffer.slice(clauseIdx + 1);
          if (this.isValidChunk(chunk)) {
            emittedChunks.push(chunk);
          }
        } else {
          // Break on nearest space before maxChunkLength
          const lastSpace = this.buffer.lastIndexOf(' ', this.maxChunkLength);
          if (lastSpace > this.minChunkLength) {
            const chunk = this.buffer.slice(0, lastSpace).trim();
            this.buffer = this.buffer.slice(lastSpace + 1);
            if (this.isValidChunk(chunk)) {
              emittedChunks.push(chunk);
            }
          } else {
            // Buffer is a single huge token without spaces; wait for more text
            break;
          }
        }
      } else {
        // No full sentence boundary yet
        break;
      }
    }

    return emittedChunks;
  }

  /**
   * Flush any remaining residual text at the end of the LLM stream.
   */
  public flush(): string[] {
    if (this.isCancelled) {
      this.buffer = '';
      return [];
    }

    const residual = this.buffer.trim();
    this.buffer = '';

    if (this.isValidChunk(residual)) {
      return [residual];
    }

    return [];
  }

  /**
   * Cancel processing immediately and discard all buffered text (e.g. on user barge-in).
   */
  public cancel(): void {
    this.isCancelled = true;
    this.buffer = '';
  }

  /**
   * Reset chunker state for a new turn.
   */
  public reset(): void {
    this.isCancelled = false;
    this.buffer = '';
  }

  private findNextSentenceEnd(text: string): number {
    // Terminators: period, exclamation, question mark, Hindi purna viram (।), double danda (॥)
    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char === '.' || char === '!' || char === '?' || char === '।' || char === '॥') {
        // Check for ellipsis: e.g. "..."
        if (char === '.' && i + 1 < text.length && text[i + 1] === '.') {
          // Skip dots until end of ellipsis
          while (i + 1 < text.length && text[i + 1] === '.') {
            i++;
          }
          continue;
        }

        // Check for abbreviations (e.g. "Dr. Sharma" or "Rs. 500")
        if (char === '.') {
          const prevWord = this.getPrecedingWord(text, i);
          if (prevWord && SentenceChunker.ABBREVIATIONS.has(prevWord.toLowerCase())) {
            continue;
          }

          // Check if followed immediately by digit (e.g., "$39.99" or "3.5")
          if (i + 1 < text.length && /\d/.test(text[i + 1])) {
            continue;
          }
        }

        // Must be followed by whitespace, closing quote, or end of text to be a sentence end
        const nextChar = i + 1 < text.length ? text[i + 1] : ' ';
        if (/\s|["'”’)]/.test(nextChar)) {
          // Include any immediately trailing quote or bracket
          let endIdx = i;
          if (i + 1 < text.length && /["'”’)]/.test(text[i + 1])) {
            endIdx = i + 1;
          }
          return endIdx;
        }
      }
    }

    return -1;
  }

  private findClauseBoundary(text: string): number {
    // Look for comma, semicolon, colon, or em-dash within allowed boundary range
    for (let i = Math.min(text.length - 1, this.maxChunkLength); i >= this.minChunkLength; i--) {
      const char = text[i];
      if ((char === ',' || char === ';' || char === ':' || char === '—') && i + 1 < text.length && /\s/.test(text[i + 1])) {
        return i;
      }
    }
    return -1;
  }

  private getPrecedingWord(text: string, dotIdx: number): string | null {
    let start = dotIdx - 1;
    while (start >= 0 && /[a-zA-Z]/.test(text[start])) {
      start--;
    }
    const word = text.slice(start + 1, dotIdx);
    return word || null;
  }

  private isValidChunk(chunk: string): boolean {
    if (!chunk || chunk.trim().length === 0) return false;
    // Strip punctuation to verify actual words exist
    const stripped = chunk.replace(/[.,/#!$%^&*;:{}=\-_`~()।॥'"]/g, '').trim();
    return stripped.length > 0;
  }
}
