import { describe, it, expect } from 'bun:test';
import { synthesizeCartesia, synthesizeSarvam, synthesizeSpeech } from '../src/services/tts/ttsService.ts';

describe('Auris 2.0 Text-to-Speech (TTS) Synthesis Tests', () => {
  it('synthesizes speech via Cartesia Sonic (8000Hz raw mulaw)', async () => {
    if (!process.env.CARTESIA_API_KEY) {
      console.warn('Skipping live Cartesia test (no CARTESIA_API_KEY)');
      return;
    }

    const audioBuffer = await synthesizeCartesia('Hello, testing Auris voice pipeline.');
    expect(audioBuffer).toBeDefined();
    expect(audioBuffer.length).toBeGreaterThan(1000);
  });

  it('synthesizes Indic speech via Sarvam AI Bulbul (Telugu)', async () => {
    if (!process.env.SARVAM_API_KEY) {
      console.warn('Skipping live Sarvam Bulbul test (no SARVAM_API_KEY)');
      return;
    }

    const audioBuffer = await synthesizeSarvam('నమస్కారం! టెస్టింగ్ ఆరిస్ వాయిస్.');
    expect(audioBuffer).toBeDefined();
    expect(audioBuffer.length).toBeGreaterThan(1000);
  });

  it('auto-dispatches to Sarvam for Telugu and Cartesia for English', async () => {
    if (process.env.SARVAM_API_KEY) {
      const teluguResult = await synthesizeSpeech('నమస్కారం', { languageCode: 'te-IN' });
      expect(teluguResult.provider).toBe('sarvam');
      expect(teluguResult.audioBuffer.length).toBeGreaterThan(500);
    }

    if (process.env.CARTESIA_API_KEY) {
      const englishResult = await synthesizeSpeech('Welcome to Auris', { languageCode: 'en-US' });
      expect(englishResult.provider).toBe('cartesia');
      expect(englishResult.audioBuffer.length).toBeGreaterThan(500);
    }
  });
});

