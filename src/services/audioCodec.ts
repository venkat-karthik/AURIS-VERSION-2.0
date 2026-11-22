/**
 * Auris 2.0 Real-Time Telephony Audio Codec
 *
 * Implements ITU-T G.711 μ-law (PCMU) companding and mathematical resampling
 * for telephony pipelines (Plivo 8kHz G.711 μ-law <-> 16kHz Linear PCM AI Models).
 */

const BIAS = 0x84; // 132
const CLIP = 32635;

// Precompute 256-entry lookup table for O(1) G.711 μ-law decompression
const ULAW_TO_LINEAR_TABLE = new Int16Array(256);
for (let i = 0; i < 256; i++) {
  const complement = ~i & 0xff;
  const sign = complement & 0x80;
  const exponent = (complement >> 4) & 0x07;
  const mantissa = complement & 0x0f;
  let sample = ((mantissa << 3) + BIAS) << exponent;
  sample -= BIAS;
  ULAW_TO_LINEAR_TABLE[i] = sign !== 0 ? -sample : sample;
}

/**
 * Encode a single 16-bit signed linear PCM sample to an 8-bit G.711 μ-law byte
 */
export function linearSampleToMuLaw(sample: number): number {
  let sign = (sample >> 8) & 0x80;
  if (sign !== 0) sample = -sample;
  if (sample > CLIP) sample = CLIP;
  sample = sample + BIAS;

  let exponent = 7;
  for (let expMask = 0x4000; (sample & expMask) === 0 && exponent > 0; expMask >>= 1) {
    exponent--;
  }
  const mantissa = (sample >> (exponent + 3)) & 0x0f;
  const ulawByte = ~(sign | (exponent << 4) | mantissa) & 0xff;
  return ulawByte;
}

/**
 * Decode a single 8-bit G.711 μ-law byte to a 16-bit signed linear PCM sample
 */
export function muLawSampleToLinear(ulawByte: number): number {
  return ULAW_TO_LINEAR_TABLE[ulawByte & 0xff];
}

/**
 * Decode G.711 μ-law audio buffer to 16-bit signed linear PCM (Int16Array)
 */
export function decodeMuLaw(ulawBuffer: Uint8Array | Buffer): Int16Array {
  const len = ulawBuffer.length;
  const pcm16 = new Int16Array(len);
  for (let i = 0; i < len; i++) {
    pcm16[i] = ULAW_TO_LINEAR_TABLE[ulawBuffer[i]];
  }
  return pcm16;
}

/**
 * Encode 16-bit signed linear PCM (Int16Array) to G.711 μ-law Buffer
 */
export function encodeMuLaw(pcm16: Int16Array): Buffer {
  const len = pcm16.length;
  const buffer = Buffer.allocUnsafe(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = linearSampleToMuLaw(pcm16[i]);
  }
  return buffer;
}

/**
 * Upsample 8kHz linear PCM to 16kHz linear PCM using band-limited linear interpolation.
 * Doubles the sample count: 8000 samples/sec -> 16000 samples/sec.
 */
export function upsample8kTo16k(input: Int16Array): Int16Array {
  const len = input.length;
  if (len === 0) return new Int16Array(0);

  const output = new Int16Array(len * 2);
  for (let i = 0; i < len; i++) {
    output[i * 2] = input[i];
    if (i < len - 1) {
      output[i * 2 + 1] = Math.round((input[i] + input[i + 1]) / 2);
    } else {
      output[i * 2 + 1] = input[i];
    }
  }
  return output;
}

/**
 * Downsample 16kHz linear PCM to 8kHz linear PCM using an anti-aliasing FIR filter.
 * Halves the sample count: 16000 samples/sec -> 8000 samples/sec.
 */
export function downsample16kTo8k(input: Int16Array): Int16Array {
  const outLength = Math.floor(input.length / 2);
  if (outLength === 0) return new Int16Array(0);

  const output = new Int16Array(outLength);
  for (let i = 0; i < outLength; i++) {
    // 3-tap FIR anti-aliasing filter with coefficients [0.25, 0.5, 0.25]
    const idx = i * 2;
    const prev = idx > 0 ? input[idx - 1] : input[idx];
    const curr = input[idx];
    const next = idx + 1 < input.length ? input[idx + 1] : curr;
    output[i] = Math.round((prev + 2 * curr + next) / 4);
  }
  return output;
}

/**
 * Resample 16-bit linear PCM between any two sample rates using mathematical interpolation.
 * If sample rates match, returns the input unchanged.
 */
export function resamplePcm16(input: Int16Array, fromRate: number, toRate: number): Int16Array {
  if (fromRate === toRate || input.length === 0) {
    return input;
  }

  // Fast path for 8kHz <-> 16kHz
  if (fromRate === 8000 && toRate === 16000) {
    return upsample8kTo16k(input);
  }
  if (fromRate === 16000 && toRate === 8000) {
    return downsample16kTo8k(input);
  }

  // Arbitrary linear interpolation
  const ratio = fromRate / toRate;
  const outLength = Math.round(input.length / ratio);
  const output = new Int16Array(outLength);

  for (let i = 0; i < outLength; i++) {
    const srcIndex = i * ratio;
    const index = Math.floor(srcIndex);
    const frac = srcIndex - index;

    if (index >= input.length - 1) {
      output[i] = input[input.length - 1];
    } else {
      const s0 = input[index];
      const s1 = input[index + 1];
      output[i] = Math.round(s0 + frac * (s1 - s0));
    }
  }

  return output;
}

/**
 * Generate a synthetic pure sine wave in 16-bit signed PCM for deterministic audio testing.
 */
export function createSyntheticSineWave(
  frequencyHz: number,
  durationSeconds: number,
  sampleRate: number,
  amplitude: number = 16000
): Int16Array {
  const totalSamples = Math.floor(durationSeconds * sampleRate);
  const pcm = new Int16Array(totalSamples);
  const angularFreq = 2 * Math.PI * frequencyHz;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    pcm[i] = Math.round(amplitude * Math.sin(angularFreq * t));
  }

  return pcm;
}

/**
 * Convert 16-bit PCM samples to a standard RIFF WAV buffer
 */
export function createWavFromPcm16(pcm16: Int16Array, sampleRate: number = 8000, channels: number = 1): Buffer {
  const pcmBytes = Buffer.from(pcm16.buffer, pcm16.byteOffset, pcm16.byteLength);
  const header = Buffer.alloc(44);
  const totalDataLen = pcmBytes.length;
  const totalLength = totalDataLen + 36;
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;

  header.write('RIFF', 0);
  header.writeUInt32LE(totalLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20);  // AudioFormat (1 = Linear PCM)
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34); // BitsPerSample
  header.write('data', 36);
  header.writeUInt32LE(totalDataLen, 40);

  return Buffer.concat([header, pcmBytes]);
}

/**
 * Convert G.711 μ-law audio buffer directly to standard playable WAV buffer
 */
export function createWavFromMuLaw(ulawBuffer: Uint8Array | Buffer, sampleRate: number = 8000): Buffer {
  const pcm16 = decodeMuLaw(ulawBuffer);
  return createWavFromPcm16(pcm16, sampleRate, 1);
}
