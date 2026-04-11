/**
 * Extract approximate waveform visualization data from an audio buffer.
 *
 * This samples byte values at regular intervals across the buffer to produce
 * a deterministic, visually varied waveform. Not acoustically accurate but
 * produces good-looking waveform bars that differ between audio files.
 */
export function extractWaveformFromBuffer(buffer: Buffer, bars: number = 80): number[] {
  if (buffer.length === 0) {
    return Array(bars).fill(0.3)
  }

  const step = Math.max(1, Math.floor(buffer.length / bars))
  const waveform: number[] = []

  for (let i = 0; i < bars; i++) {
    const offset = i * step
    // Sample a small window around the offset for smoother results
    let sum = 0
    const windowSize = Math.min(8, step)
    for (let j = 0; j < windowSize; j++) {
      const idx = Math.min(offset + j, buffer.length - 1)
      sum += buffer[idx]
    }
    const avg = sum / windowSize
    // Normalize to 0-1 range with some minimum height for visual appeal
    const normalized = Math.max(0.08, avg / 255)
    waveform.push(Math.round(normalized * 100) / 100)
  }

  return waveform
}
