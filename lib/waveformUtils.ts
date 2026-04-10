// Generate an SVG waveform from an array of 0-1 values
export function generateWaveformSVG(
  data: number[],
  options: {
    width?: number
    height?: number
    barWidth?: number
    barGap?: number
    barColor?: string
    barRadius?: number
  } = {}
): string {
  const {
    width = 280,
    height = 40,
    barWidth = 2,
    barGap = 1,
    barColor = '#2A2A2A',
    barRadius = 1,
  } = options

  const totalBarWidth = barWidth + barGap
  const numBars = Math.floor(width / totalBarWidth)
  
  // Resample data to fit the number of bars
  const resampledData = resampleData(data, numBars)
  
  const bars = resampledData.map((value, index) => {
    const barHeight = Math.max(2, value * height * 0.9)
    const x = index * totalBarWidth
    const y = (height - barHeight) / 2
    
    return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="${barRadius}" fill="${barColor}" />`
  }).join('\n')

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`
}

// Resample data array to a different length
function resampleData(data: number[], targetLength: number): number[] {
  const result: number[] = []
  const ratio = data.length / targetLength
  
  for (let i = 0; i < targetLength; i++) {
    const sourceIndex = Math.floor(i * ratio)
    result.push(data[Math.min(sourceIndex, data.length - 1)])
  }
  
  return result
}

// Play a sine wave tone for demo purposes
export function playTone(frequency = 220, duration = 2): { stop: () => void } {
  if (typeof window === 'undefined') {
    return { stop: () => {} }
  }
  
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  
  osc.connect(gain)
  gain.connect(ctx.destination)
  
  osc.frequency.value = frequency
  osc.type = 'sine'
  
  // Fade in/out for smoother sound
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1)
  gain.gain.setValueAtTime(0.1, ctx.currentTime + duration - 0.1)
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)
  
  osc.start()
  osc.stop(ctx.currentTime + duration)
  
  return {
    stop: () => {
      try {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05)
        setTimeout(() => {
          osc.stop()
          ctx.close()
        }, 50)
      } catch {
        // Already stopped
      }
    }
  }
}

// Format duration as MM:SS or 0:SS
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Format play count with K suffix for thousands
export function formatPlayCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}
