'use client'

import LayerTrackGhost from './LayerTrackGhost'
import { LAYER_TYPES, LAYER_COLORS, LAYER_LABELS } from '@/lib/scene-types'
import type { SceneLayerSpec, SceneLayerResult, LayerType } from '@/lib/scene-types'

interface SceneGeneratingProps {
  description: string
  layerSpecs: SceneLayerSpec[]
  layerResults: Map<LayerType, SceneLayerResult>
}

export default function SceneGenerating({
  description,
  layerSpecs,
  layerResults,
}: SceneGeneratingProps) {
  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-16 animate-fade-in-up">
      <div className="max-w-2xl mx-auto">
        {/* Scene description echo */}
        <p className="font-serif text-2xl text-text-primary text-center mb-2">
          &ldquo;{description}&rdquo;
        </p>
        <p className="font-mono text-xs text-text-tertiary text-center mb-10">
          Decomposing scene into 4 sonic layers...
        </p>

        {/* Layer progress rows */}
        <div className="flex flex-col gap-3">
          {layerSpecs.length > 0
            ? layerSpecs.map((spec) => {
                const result = layerResults.get(spec.type)
                const status = result?.status

                return (
                  <div
                    key={spec.type}
                    className="flex items-center gap-4 px-4 py-3 bg-bg-surface border border-border-default rounded-lg animate-slide-in-left"
                  >
                    {/* Color dot + label */}
                    <div className="w-28 flex-shrink-0 flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background: LAYER_COLORS[spec.type],
                          opacity: status === 'complete' ? 1 : 0.4,
                        }}
                      />
                      <span
                        className="font-mono text-[10px] tracking-wider font-medium"
                        style={{ color: LAYER_COLORS[spec.type] }}
                      >
                        {LAYER_LABELS[spec.type]}
                      </span>
                    </div>

                    {/* Query description */}
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-xs text-text-secondary truncate">
                        {spec.query}
                      </p>
                    </div>

                    {/* Status indicator */}
                    <div className="w-28 flex-shrink-0 text-right">
                      {status === 'complete' ? (
                        <span className="font-mono text-xs text-green-500">Done</span>
                      ) : status === 'error' ? (
                        <span className="font-mono text-xs text-red-500">Failed</span>
                      ) : status === 'generating' ? (
                        <span className="font-mono text-xs text-text-secondary animate-pulse">
                          Generating...
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-text-tertiary animate-pulse">
                          Pending...
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            : // Show ghost placeholders before decomposition arrives
              LAYER_TYPES.map((type) => (
                <LayerTrackGhost key={type} layerType={type} />
              ))}
        </div>

        {/* Progress footer */}
        <div className="mt-8 text-center">
          <p className="font-mono text-xs text-text-tertiary">
            {layerSpecs.length === 0
              ? 'Analyzing scene...'
              : `${Array.from(layerResults.values()).filter(r => r.status === 'complete').length} / 4 layers complete`}
          </p>
        </div>
      </div>
    </div>
  )
}
