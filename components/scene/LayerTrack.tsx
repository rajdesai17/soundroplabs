'use client'

import { Play, Pause, Download } from 'lucide-react'
import WaveformThumbnail from '../shared/WaveformThumbnail'
import { LAYER_COLORS, LAYER_LABELS } from '@/lib/scene-types'
import type { LayerType, SceneLayerResult } from '@/lib/scene-types'

interface LayerTrackProps {
  layer: SceneLayerResult
  trackState: { isPlaying: boolean; progress: number } | null
  onTogglePlay: () => void
  onDownload: () => void
}

export default function LayerTrack({
  layer,
  trackState,
  onTogglePlay,
  onDownload,
}: LayerTrackProps) {
  const color = LAYER_COLORS[layer.type]
  const label = LAYER_LABELS[layer.type]
  const isError = layer.status === 'error'
  const isPlaying = trackState?.isPlaying ?? false
  const progress = trackState?.progress ?? 0

  if (isError) {
    return (
      <div className="flex items-center gap-4 px-4 py-3 bg-bg-surface border border-border-default rounded-lg opacity-50">
        <div className="w-28 flex-shrink-0">
          <span className="font-mono text-[10px] tracking-wider font-medium text-text-tertiary">
            {label}
          </span>
        </div>
        <div className="flex-1">
          <span className="font-mono text-xs text-red-500">
            {layer.error || 'Generation failed'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-bg-surface border border-border-default rounded-lg transition-colors hover:border-border-hover">
      {/* Label */}
      <div className="w-28 flex-shrink-0 flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: color }}
        />
        <span
          className="font-mono text-[10px] tracking-wider font-medium"
          style={{ color }}
        >
          {label}
        </span>
      </div>

      {/* Waveform */}
      <div className="flex-1 min-w-0">
        <WaveformThumbnail
          data={layer.waveformData}
          width={400}
          height={32}
          progress={progress}
          barColor="#2A2A2A"
          progressColor={color}
        />
      </div>

      {/* Duration */}
      <span className="font-mono text-xs text-text-tertiary w-10 text-right flex-shrink-0">
        {layer.duration}s
      </span>

      {/* Controls */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onTogglePlay}
          className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={onDownload}
          className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Download"
        >
          <Download size={14} />
        </button>
      </div>
    </div>
  )
}
