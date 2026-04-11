'use client'

import { LAYER_COLORS, LAYER_LABELS } from '@/lib/scene-types'
import type { LayerType } from '@/lib/scene-types'

interface LayerTrackGhostProps {
  layerType: LayerType
  status?: string
}

export default function LayerTrackGhost({ layerType, status }: LayerTrackGhostProps) {
  const color = LAYER_COLORS[layerType]
  const label = LAYER_LABELS[layerType]

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-bg-surface border border-border-default rounded-lg">
      {/* Label */}
      <div className="w-28 flex-shrink-0">
        <span
          className="font-mono text-[10px] tracking-wider font-medium"
          style={{ color }}
        >
          {label}
        </span>
      </div>

      {/* Shimmer waveform placeholder */}
      <div className="flex-1 h-8 bg-bg-elevated rounded animate-shimmer" />

      {/* Status */}
      <div className="w-32 flex-shrink-0 text-right">
        <span className="font-mono text-xs text-text-tertiary">
          {status || 'Waiting...'}
        </span>
      </div>
    </div>
  )
}
