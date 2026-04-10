'use client'

interface WaveformThumbnailProps {
  data: number[]
  width?: number
  height?: number
  barColor?: string
  progressColor?: string
  progress?: number // 0-1
  animated?: boolean
  className?: string
}

export default function WaveformThumbnail({
  data,
  width = 280,
  height = 40,
  barColor = '#2A2A2A',
  progressColor = '#E8F055',
  progress = 0,
  animated = false,
  className = '',
}: WaveformThumbnailProps) {
  const barWidth = 2
  const barGap = 1
  const totalBarWidth = barWidth + barGap
  const numBars = Math.floor(width / totalBarWidth)
  
  // Resample data to fit
  const resampledData: number[] = []
  const ratio = data.length / numBars
  for (let i = 0; i < numBars; i++) {
    const sourceIndex = Math.floor(i * ratio)
    resampledData.push(data[Math.min(sourceIndex, data.length - 1)])
  }

  const progressIndex = Math.floor(progress * numBars)

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className={className}
      style={{ display: 'block' }}
    >
      {resampledData.map((value, index) => {
        const barHeight = Math.max(2, value * height * 0.9)
        const x = index * totalBarWidth
        const y = (height - barHeight) / 2
        const isActive = index < progressIndex
        
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={1}
            fill={isActive ? progressColor : barColor}
            className={animated ? 'waveform-bar' : ''}
            style={animated ? { animationDelay: `${(index % 5) * 0.1}s` } : {}}
          />
        )
      })}
    </svg>
  )
}
