import { describe, it, expect } from 'bun:test';
import { createWavFromMuLaw, createSyntheticSineWave, encodeMuLaw } from '../src/services/audioCodec.ts';
import { synthesizeSpeech } from '../src/services/tts/ttsService.ts';

describe('Auris 2.0 Website Upgrades & Studio Integration Tests', () => {
  it('converts μ-law audio to standard playable RIFF WAV for in-browser visualizer', () => {
    // Generate synthetic 440Hz test sine wave and encode to μ-law
    const sine = createSyntheticSineWave(440, 0.5, 8000);
    const mulaw = encodeMuLaw(sine);

    // Convert to browser-playable WAV
    const wav = createWavFromMuLaw(mulaw, 8000);

    expect(wav).toBeDefined();
    expect(wav.length).toBeGreaterThan(mulaw.length);

    // Verify RIFF and WAVE header magic bytes
    expect(wav.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(wav.subarray(8, 12).toString('ascii')).toBe('WAVE');
    expect(wav.subarray(12, 16).toString('ascii')).toBe('fmt ');
    expect(wav.readUInt16LE(20)).toBe(1); // Linear PCM format
    expect(wav.readUInt32LE(24)).toBe(8000); // 8000Hz sample rate
  });

  it('synthesizes live in-browser preview with proper duration and format', async () => {
    if (!process.env.SARVAM_API_KEY && !process.env.CARTESIA_API_KEY) {
      console.warn('Skipping live synthesis test (no keys configured)');
      return;
    }

    const teluguText = 'నమస్కారం! నేను ఆరిస్ వాయిస్ అసిస్టెంట్ ని.';
    const result = await synthesizeSpeech(teluguText, {
      languageCode: 'te-IN',
      voiceId: 'kavya',
      provider: 'sarvam',
    });

    expect(result).toBeDefined();
    expect(result.provider).toBe('sarvam');
    expect(result.audioBuffer.length).toBeGreaterThan(500);

    // Convert to playable WAV if needed
    let wavBuffer: Buffer;
    if (result.format === 'audio/x-mulaw') {
      wavBuffer = createWavFromMuLaw(result.audioBuffer, result.sampleRate || 8000);
    } else {
      wavBuffer = result.audioBuffer;
    }

    expect(wavBuffer.length).toBeGreaterThan(500);
    const base64 = wavBuffer.toString('base64');
    expect(base64.length).toBeGreaterThan(100);
  });
});

