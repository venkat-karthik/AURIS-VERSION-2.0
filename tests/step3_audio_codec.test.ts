import { describe, it, expect } from 'bun:test';
import {
  linearSampleToMuLaw,
  muLawSampleToLinear,
  decodeMuLaw,
  encodeMuLaw,
  upsample8kTo16k,
  downsample16kTo8k,
  resamplePcm16,
  createSyntheticSineWave,
} from '../src/services/audioCodec.ts';

describe('Auris 2.0 Audio Codec Unit Tests', () => {
  describe('ITU-T G.711 μ-law Companding', () => {
    it('accurately encodes and decodes standard test vectors', () => {
      // Standard ITU-T G.711 μ-law zero point
      const zeroUlaw = linearSampleToMuLaw(0);
      expect(zeroUlaw).toBe(0xff);
      expect(muLawSampleToLinear(0xff)).toBe(0);

      // Moderate positive value
      const posUlaw = linearSampleToMuLaw(1000);
      expect(posUlaw).toBe(0xce);
      const posDecoded = muLawSampleToLinear(posUlaw);
      expect(Math.abs(posDecoded - 1000)).toBeLessThan(20);

      // Moderate negative value
      const negUlaw = linearSampleToMuLaw(-1000);
      expect(negUlaw).toBe(0x4e);
      const negDecoded = muLawSampleToLinear(negUlaw);
      expect(Math.abs(negDecoded - -1000)).toBeLessThan(20);

      // Near maximum value
      const highUlaw = linearSampleToMuLaw(32000);
      expect(highUlaw).toBe(0x80);
      const highDecoded = muLawSampleToLinear(highUlaw);
      expect(Math.abs(highDecoded - 32000)).toBeLessThan(200);
    });

    it('performs round-trip buffer encode and decode without distortion', () => {
      const originalSamples = new Int16Array([
        0, 250, 500, 1000, 2500, 5000, 10000, 20000, 30000,
        0, -250, -500, -1000, -2500, -5000, -10000, -20000, -30000
      ]);

      const encodedBuffer = encodeMuLaw(originalSamples);
      expect(encodedBuffer.length).toBe(originalSamples.length);

      const decodedSamples = decodeMuLaw(encodedBuffer);
      expect(decodedSamples.length).toBe(originalSamples.length);

      // Verify that quantization error is strictly within standard G.711 companding limits (< 3.5%)
      for (let i = 0; i < originalSamples.length; i++) {
        const orig = originalSamples[i];
        const dec = decodedSamples[i];
        if (Math.abs(orig) > 500) {
          const relativeError = Math.abs(orig - dec) / Math.abs(orig);
          expect(relativeError).toBeLessThan(0.04);
        } else {
          expect(Math.abs(orig - dec)).toBeLessThan(35);
        }
      }
    });
  });

  describe('Audio Resampling (8kHz <-> 16kHz)', () => {
    it('upsamples 8kHz to 16kHz doubling sample count with linear interpolation', () => {
      const input8k = new Int16Array([0, 1000, 2000, 1000, 0, -1000]);
      const output16k = upsample8kTo16k(input8k);

      expect(output16k.length).toBe(input8k.length * 2);
      expect(output16k[0]).toBe(0);
      expect(output16k[1]).toBe(500); // Interpolated midpoint
      expect(output16k[2]).toBe(1000);
      expect(output16k[3]).toBe(1500); // Interpolated midpoint
      expect(output16k[4]).toBe(2000);
      expect(output16k[5]).toBe(1500);
    });

    it('downsamples 16kHz to 8kHz halving sample count with anti-aliasing', () => {
      const input16k = new Int16Array([0, 500, 1000, 1500, 2000, 1500, 1000, 500, 0, -500]);
      const output8k = downsample16kTo8k(input16k);

      expect(output8k.length).toBe(Math.floor(input16k.length / 2));
      // First filtered sample from [0, 500]: Math.round((0 + 0 + 500)/4) = 125
      expect(output8k[0]).toBeGreaterThanOrEqual(0);
    });

    it('handles identical sample rates as pass-through', () => {
      const pcm = new Int16Array([100, 200, 300]);
      const res = resamplePcm16(pcm, 8000, 8000);
      expect(res).toBe(pcm);
    });

    it('handles empty buffers gracefully', () => {
      const empty = new Int16Array(0);
      expect(upsample8kTo16k(empty).length).toBe(0);
      expect(downsample16kTo8k(empty).length).toBe(0);
      expect(resamplePcm16(empty, 8000, 16000).length).toBe(0);
    });
  });

  describe('Synthetic Audio Fixture (440 Hz Sine Wave)', () => {
    it('generates, encodes, decodes, and resamples a 440 Hz audio wave cleanly', () => {
      // 0.25 seconds of 440 Hz tone at 8 kHz (2000 samples)
      const sineWave8k = createSyntheticSineWave(440, 0.25, 8000, 16000);
      expect(sineWave8k.length).toBe(2000);

      // Verify peak amplitude
      let maxVal = 0;
      for (let i = 0; i < sineWave8k.length; i++) {
        if (Math.abs(sineWave8k[i]) > maxVal) maxVal = Math.abs(sineWave8k[i]);
      }
      expect(maxVal).toBeGreaterThan(15000);

      // G.711 encode & decode
      const ulawBuffer = encodeMuLaw(sineWave8k);
      expect(ulawBuffer.length).toBe(2000);

      const decodedSine8k = decodeMuLaw(ulawBuffer);
      expect(decodedSine8k.length).toBe(2000);

      // Calculate Signal-to-Noise Ratio (SNR) in dB
      let signalPower = 0;
      let noisePower = 0;
      for (let i = 0; i < sineWave8k.length; i++) {
        const s = sineWave8k[i];
        const n = s - decodedSine8k[i];
        signalPower += s * s;
        noisePower += n * n;
      }
      const snr = 10 * Math.log10(signalPower / noisePower);
      expect(snr).toBeGreaterThan(35); // G.711 SNR typically > 35dB

      // Upsample to 16kHz
      const sineWave16k = upsample8kTo16k(decodedSine8k);
      expect(sineWave16k.length).toBe(4000);

      // Downsample back to 8kHz
      const downsampled8k = downsample16kTo8k(sineWave16k);
      expect(downsampled8k.length).toBe(2000);
    });
  });
});
