import { STTOptions, StreamingSTTProvider } from './types.ts';
import { SarvamStreamingSTTClient } from './sarvamStreamingClient.ts';

/**
 * Resolve BCP-47 language code for Indic speech recognition from agent configuration.
 * Supports Telugu, Hindi, English, Tamil, Kannada, Bengali, Marathi, and adaptive code-mixing ('auto').
 */
export function resolveSarvamLanguageCode(agentLanguage?: string): string {
  if (!agentLanguage) return 'auto';

  const clean = agentLanguage.toLowerCase().trim();

  if (clean.includes('telugu') || clean.includes('te-in') || clean.includes('తెలుగు')) {
    return 'te-IN';
  }
  if (clean.includes('hindi') || clean.includes('hi-in') || clean.includes('हिन्दी')) {
    return 'hi-IN';
  }
  if (clean.includes('tamil') || clean.includes('ta-in') || clean.includes('தமிழ்')) {
    return 'ta-IN';
  }
  if (clean.includes('kannada') || clean.includes('kn-in') || clean.includes('ಕನ್ನಡ')) {
    return 'kn-IN';
  }
  if (clean.includes('bengali') || clean.includes('bn-in') || clean.includes('বাংলা')) {
    return 'bn-IN';
  }
  if (clean.includes('marathi') || clean.includes('mr-in') || clean.includes('मराठी')) {
    return 'mr-IN';
  }
  if (clean.includes('english') || clean.includes('en-in') || clean.includes('en-us')) {
    return 'en-IN';
  }

  // Mixed or auto
  return 'auto';
}

/**
 * Factory function to create a Streaming STT client.
 * Decouples speech recognition providers from the Auris media transport layer.
 */
export function createStreamingSTT(options: STTOptions): StreamingSTTProvider {
  return new SarvamStreamingSTTClient(options);
}
