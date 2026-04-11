'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import VariationCard from '../shared/VariationCard'
import NeighborList from '../shared/NeighborList'
import { Variation, Neighbor } from '@/lib/types'
import { refinementOptions } from '@/lib/mockData'

interface ZoneCProps {
  query: string
  variations: Variation[]
  neighbors: Neighbor[]
  onNewSearch: () => void
  onRefine: (modifier: string) => void
  tpLatencyMs?: number | null
  onGenerateMusicBed?: () => void
  musicBedUrl?: string | null
  musicBedLoading?: boolean
  musicBedError?: boolean
}

export default function ZoneC({
  query,
  variations,
  neighbors,
  onNewSearch,
  onRefine,
  tpLatencyMs,
  onGenerateMusicBed,
  musicBedUrl,
  musicBedLoading = false,
  musicBedError = false,
}: ZoneCProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case '1':
        case '2':
        case '3':
        case '4':
          e.preventDefault()
          setSelectedIndex(parseInt(e.key) - 1)
          break
        case ' ':
          e.preventDefault()
          togglePlay(selectedIndex)
          break
        case 'Enter':
          e.preventDefault()
          handleDownload(selectedIndex)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex])

  const togglePlay = useCallback((index: number) => {
    setPlayingIndex((prev) => (prev === index ? null : index))
  }, [])

  const handleDownload = useCallback((index: number) => {
    const variation = variations[index]
    if (!variation?.audioUrl) return
    const url = variation.audioUrl.includes('.blob.vercel-storage.com')
      ? `/api/blob?url=${encodeURIComponent(variation.audioUrl)}`
      : variation.audioUrl
    const a = document.createElement('a')
    a.href = url
    a.download = `sounddrop-variation-${variation.index}.mp3`
    a.click()
  }, [variations])

  const toggleFavorite = useCallback(async (index: number) => {
    const variation = variations[index]
    if (!variation) return

    const isFav = favorites.has(index)

    // Optimistic UI update
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })

    try {
      if (isFav) {
        // Unfavorite — skip for now, would need library entry ID
        return
      }
      // Save to library
      await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: variation.id,
          variationId: variation.id,
          query,
          audioUrl: variation.audioUrl,
          duration: variation.duration,
          waveformData: variation.waveformData,
        }),
      })
    } catch {
      // Revert on failure
      setFavorites((prev) => {
        const next = new Set(prev)
        if (isFav) next.add(index)
        else next.delete(index)
        return next
      })
    }
  }, [variations, favorites, query])

  const handleRegenerate = useCallback((index: number) => {
    console.log(`Regenerating variation ${index + 1}`)
    // Would trigger regeneration of just this slot
  }, [])

  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-8 animate-fade-in-up">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Area (65%) */}
          <div className="flex-1 lg:w-2/3">
            {/* 2x2 Variation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {variations.map((variation, index) => (
                <VariationCard
                  key={variation.id}
                  variation={variation}
                  isSelected={selectedIndex === index}
                  isPlaying={playingIndex === index}
                  onSelect={() => setSelectedIndex(index)}
                  onTogglePlay={() => togglePlay(index)}
                  onDownload={() => handleDownload(index)}
                  onFavorite={() => toggleFavorite(index)}
                  onRegenerate={() => handleRegenerate(index)}
                  isFavorited={favorites.has(index)}
                />
              ))}
            </div>

            {/* Refinement Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="font-sans text-sm text-text-tertiary mr-1">Refine:</span>
              {refinementOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => onRefine(option)}
                  className="font-mono text-xs text-text-secondary border border-border-default px-2.5 py-1 rounded hover:bg-bg-elevated hover:text-text-primary transition-colors"
                >
                  {option} ↻
                </button>
              ))}
            </div>

            {/* Music Bed Section */}
            <div className="pt-4 border-t border-border-default mb-6">
              {!musicBedUrl && onGenerateMusicBed && (
                <button
                  onClick={onGenerateMusicBed}
                  disabled={musicBedLoading}
                  className={`font-sans text-[13px] border border-border-default rounded px-4 py-2 flex items-center gap-2 transition-colors ${
                    musicBedLoading
                      ? 'text-text-tertiary cursor-not-allowed'
                      : 'text-text-primary hover:border-border-hover cursor-pointer'
                  }`}
                >
                  {musicBedLoading
                    ? 'Generating music bed...'
                    : '\u266A  Generate music bed'}
                </button>
              )}

              {musicBedError && (
                <p className="font-mono text-xs text-red-500 mt-2">
                  Generation failed — try again
                </p>
              )}

              {musicBedUrl && (
                <div className="bg-bg-elevated border border-border-default rounded-lg p-3">
                  <div className="font-mono text-[10px] text-text-tertiary tracking-wider uppercase mb-2">
                    Music bed — ElevenLabs Music API
                  </div>
                  <audio
                    src={musicBedUrl}
                    controls
                    className="w-full h-8"
                    style={{ accentColor: '#E8F055' }}
                  />
                  <div className="font-mono text-[11px] text-text-tertiary mt-1.5">
                    30s instrumental · play alongside your SFX
                  </div>
                </div>
              )}
            </div>

            {/* New Search Link */}
            <button
              onClick={onNewSearch}
              className="flex items-center gap-1 font-sans text-sm text-text-tertiary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={14} />
              New search
            </button>
          </div>

          {/* Sidebar (35%) */}
          <div className="lg:w-1/3">
            <p className="font-mono text-[10px] text-text-tertiary tracking-wider mb-4 uppercase">
              SHAPED BY
            </p>
            <p className="font-sans text-sm text-text-secondary mb-4">
              8 sounds from our library
            </p>
            <NeighborList neighbors={neighbors} />

            {tpLatencyMs != null && (
              <div className="font-mono text-[11px] text-text-tertiary mt-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sd-accent inline-block flex-shrink-0" />
                turbopuffer · found {neighbors.length} neighbors in {tpLatencyMs}ms
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
