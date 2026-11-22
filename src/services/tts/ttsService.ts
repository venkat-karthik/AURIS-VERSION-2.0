/**
 * Auris 2.0 Unified Text-to-Speech (TTS) Service
 * Supports Cartesia Sonic (ultra-low latency ~100ms) and Sarvam AI Bulbul (Indic native dialects).
 */

export interface TTSOptions {
  provider?: 'cartesia' | 'sarvam' | 'auto';
  languageCode?: string; // e.g. 'te-IN', 'hi-IN', 'en'
  voiceId?: string; // Cartesia voice ID or Sarvam speaker name
  sampleRate?: number; // Default: 8000 for telephony
  encoding?: 'pcm_mulaw' | 'pcm_s16le';
}

export interface TTSResult {
  provider: 'cartesia' | 'sarvam';
  audioBuffer: Buffer;
  format: 'audio/x-mulaw' | 'audio/wav' | 'audio/raw';
  sampleRate: number;
  durationMsEstimate?: number;
}

/**
 * Synthesize speech via Cartesia Sonic API
 * Outputs 8000Hz raw mulaw directly compatible with Plivo telephony.
 */
export async function synthesizeCartesia(
  transcript: string,
  options?: { voiceId?: string; sampleRate?: number }
): Promise<Buffer> {
  const apiKey = process.env.CARTESIA_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('CARTESIA_API_KEY is not configured in server environment.');
  }

  const voiceId = options?.voiceId || '6385d6e7-e385-4693-b2b6-c76260452d71';
  const sampleRate = options?.sampleRate || 8000;

  const response = await fetch('https://api.cartesia.ai/tts/bytes', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Cartesia-Version': '2024-06-10',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_id: 'sonic-latest',
      transcript,
      voice: {
        mode: 'id',
        id: voiceId,
      },
      output_format: {
        container: 'raw',
        encoding: 'pcm_mulaw',
        sample_rate: sampleRate,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cartesia TTS error (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Synthesize speech via Sarvam AI Bulbul API
 * Outputs high-fidelity Indic voice (Telugu, Hindi, Tamil, Kannada, etc.)
 */
export async function synthesizeSarvam(
  text: string,
  options?: { languageCode?: string; speaker?: string; model?: string; sampleRate?: number }
): Promise<Buffer> {
  const apiKey = process.env.SARVAM_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('SARVAM_API_KEY is not configured in server environment.');
  }

  const targetLanguage = options?.languageCode || 'te-IN';
  const speaker = options?.speaker || 'kavya';
  const model = options?.model || 'bulbul:v3';
  const sampleRate = options?.sampleRate || 8000;

  const response = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: {
      'api-subscription-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: [text],
      target_language_code: targetLanguage,
      speaker,
      model,
      speech_sample_rate: sampleRate,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sarvam Bulbul TTS error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { audios?: string[] };
  if (!data.audios || data.audios.length === 0) {
    throw new Error('Sarvam Bulbul returned empty audio payload.');
  }

  return Buffer.from(data.audios[0], 'base64');
}

/**
 * Universal synthesis dispatcher based on configured provider or language
 */
export async function synthesizeSpeech(text: string, options?: TTSOptions): Promise<TTSResult> {
  const provider = options?.provider || 'auto';
  const lang = options?.languageCode || 'te-IN';

  // If auto, route Indic regional languages or text containing Indic unicode characters to Sarvam Bulbul
  const hasIndicScript = /[\u0C00-\u0C7F\u0900-\u097F\u0B80-\u0BFF\u0C80-\u0CFF]/.test(text);
  const resolvedLang = hasIndicScript && !lang.startsWith('te') && !lang.startsWith('hi') ? 'te-IN' : lang;

  const useSarvam =
    provider === 'sarvam' ||
    hasIndicScript ||
    (provider === 'auto' && (resolvedLang.startsWith('te') || resolvedLang.startsWith('hi') || resolvedLang.startsWith('ta') || resolvedLang.startsWith('kn')));

  if (useSarvam && process.env.SARVAM_API_KEY) {
    const audio = await synthesizeSarvam(text, {
      languageCode: resolvedLang,
      speaker: options?.voiceId || (resolvedLang.startsWith('te') ? 'kavya' : 'meera'),
      sampleRate: options?.sampleRate || 8000,
    });
    return {
      provider: 'sarvam',
      audioBuffer: audio,
      format: 'audio/wav',
      sampleRate: options?.sampleRate || 8000,
    };
  }

  // Fallback or explicit Cartesia
  const audio = await synthesizeCartesia(text, {
    voiceId: options?.voiceId,
    sampleRate: options?.sampleRate || 8000,
  });
  return {
    provider: 'cartesia',
    audioBuffer: audio,
    format: 'audio/x-mulaw',
    sampleRate: options?.sampleRate || 8000,
  };
}

