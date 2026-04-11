'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, Play, Pause, Download } from 'lucide-react'
import LayerTrack from './LayerTrack'
import { useSceneMixer } from '@/hooks/use-scene-mixer'
import { LAYER_TYPES } from '@/lib/scene-types'
import type { SceneLayerResult, LayerType } from '@/lib/scene-types'

interface SceneResultsProps {
  description: string
  layers: SceneLayerResult[]
  onNewScene: () => void
}

function getPlayableUrl(audioUrl: string): string {
  if (audioUrl.includes('.blob.vercel-storage.com')) {
    return `/api/blob?url=${encodeURIComponent(audioUrl)}`
  }
  return audioUrl
}

export default function SceneResults({
  description,
  layers,
  onNewScene,
}: SceneResultsProps) {
  const [exporting, setExporting] = useState(false)
  const mixer = useSceneMixer(layers)

  const completedCount = layers.filter(l => l.status === 'complete').length
  const title = description.split(/\s+/).slice(0, 6).join(' ')

  const handleDownloadLayer = useCallback((layer: SceneLayerResult) => {
    if (!layer.audioUrl) return
    const url = getPlayableUrl(layer.audioUrl)
    const a = document.createElement('a')
    a.href = url
    a.download = `${layer.type}.mp3`
    a.click()
  }, [])

  const handleExportZip = useCallback(async () => {
    setExporting(true)
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      const completedLayers = layers.filter(l => l.status === 'complete' && l.audioUrl)

      await Promise.all(
        completedLayers.map(async (layer) => {
          const url = getPlayableUrl(layer.audioUrl!)
          const response = await fetch(url)
          const blob = await response.blob()
          zip.file(`${layer.type}.mp3`, blob)
        })
      )

      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `sounddrop-scene-${Date.now()}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('ZIP export failed:', err)
    } finally {
      setExporting(false)
    }
  }, [layers])

  // Order layers by the standard LAYER_TYPES order
  const orderedLayers = LAYER_TYPES.map(
    type => layers.find(l => l.type === type)
  ).filter((l): l is SceneLayerResult => l != null)

  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-8 animate-fade-in-up">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="font-mono text-[10px] text-text-tertiary tracking-wider uppercase mb-1">
              SCENE
            </p>
            <h2 className="font-serif text-2xl text-text-primary">
              {title}{description.split(/\s+/).length > 6 ? '...' : ''}
            </h2>
            <p className="font-mono text-xs text-text-tertiary mt-1">
              {completedCount} / {layers.length} layers generated
            </p>
          </div>

          {/* Export ZIP */}
          <button
            onClick={handleExportZip}
            disabled={exporting || completedCount === 0}
            className="font-mono text-xs text-text-secondary border border-border-default px-3 py-1.5 rounded hover:bg-bg-elevated hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Download size={12} />
            {exporting ? 'Exporting...' : 'Export ZIP'}
          </button>
        </div>

        {/* Master Transport */}
        <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-bg-elevated border border-border-default rounded-lg">
          <button
            onClick={mixer.isPlaying ? mixer.pauseAll : mixer.playAll}
            disabled={completedCount === 0}
            className="w-10 h-10 flex items-center justify-center bg-sd-accent text-bg-base rounded transition-colors hover:bg-sd-accent-dim disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={mixer.isPlaying ? 'Pause all' : 'Play all'}
          >
            {mixer.isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Master progress bar */}
          <div className="flex-1 h-1 bg-bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-sd-accent transition-all duration-100"
              style={{ width: `${mixer.masterProgress * 100}%` }}
            />
          </div>

          <span className="font-mono text-xs text-text-tertiary">
            {mixer.isPlaying ? 'Playing' : 'Stopped'}
          </span>
        </div>

        {/* Layer Tracks */}
        <div className="flex flex-col gap-2 mb-8">
          {orderedLayers.map((layer) => {
            const trackState = mixer.tracks.find(t => t.layerType === layer.type) ?? null
            return (
              <LayerTrack
                key={layer.type}
                layer={layer}
                trackState={trackState}
                onTogglePlay={() => mixer.toggleTrack(layer.type)}
                onDownload={() => handleDownloadLayer(layer)}
              />
            )
          })}
        </div>

        {/* New Scene Link */}
        <button
          onClick={onNewScene}
          className="flex items-center gap-1 font-sans text-sm text-text-tertiary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          New scene
        </button>
      </div>
    </div>
  )
}
