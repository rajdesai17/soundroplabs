'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '@/components/shared/Navigation'
import VariationCard from '@/components/shared/VariationCard'
import { VariationCardGhost } from '@/components/shared/VariationCard'
import NeighborList from '@/components/shared/NeighborList'
import { Variation, Neighbor } from '@/lib/types'
import { useSession } from 'next-auth/react'

interface SoundData {
  id: string
  query: string
  enrichedPrompt?: string
  duration?: number
  category?: string
  playCount: number
  neighbors: Neighbor[]
  createdAt: string
  variations: Variation[]
}

export default function SoundPermalinkPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session } = useSession()

  const [sound, setSound] = useState<SoundData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVariation, setSelectedVariation] = useState(0)
  const [playingVariation, setPlayingVariation] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!id) return

    fetch(`/api/sound/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Sound not found')
        return res.json()
      })
      .then((data) => {
        setSound(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  const handleGenerateSimilar = () => {
    if (sound) {
      router.push(`/?q=${encodeURIComponent(sound.query)}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base">
        <Navigation
          user={session?.user ? {
            name: session.user.name ?? 'User',
            initials: (session.user.name ?? 'U').slice(0, 2).toUpperCase(),
          } : null}
        />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-bg-surface rounded w-3/4" />
            <div className="h-4 bg-bg-surface rounded w-1/2" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <VariationCardGhost key={i} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !sound) {
    return (
      <div className="min-h-screen bg-bg-base">
        <Navigation
          user={session?.user ? {
            name: session.user.name ?? 'User',
            initials: (session.user.name ?? 'U').slice(0, 2).toUpperCase(),
          } : null}
        />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="font-serif text-3xl text-text-primary mb-4">Sound not found</h1>
          <p className="font-sans text-text-secondary mb-8">
            This sound may have been removed or the link is invalid.
          </p>
          <button
            onClick={() => router.push('/')}
            className="font-sans text-sm text-sd-accent hover:text-accent-dim transition-colors"
          >
            Go to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <Navigation
        user={session?.user ? {
          name: session.user.name ?? 'User',
          initials: (session.user.name ?? 'U').slice(0, 2).toUpperCase(),
        } : null}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="font-mono text-xs text-text-tertiary mb-2">
            {sound.category?.toUpperCase()} · {new Date(sound.createdAt).toLocaleDateString()}
          </p>
          <h1 className="font-serif text-3xl text-text-primary mb-3">
            &ldquo;{sound.query}&rdquo;
          </h1>
          {sound.enrichedPrompt && (
            <p className="font-sans text-sm text-text-secondary max-w-2xl">
              {sound.enrichedPrompt}
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Variations grid */}
          <div className="flex-1">
            <h2 className="font-mono text-xs text-text-tertiary mb-4 tracking-wider">
              {sound.variations.length} VARIATIONS
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {sound.variations.map((variation, i) => (
                <VariationCard
                  key={variation.id}
                  variation={variation}
                  isSelected={selectedVariation === i}
                  isPlaying={playingVariation === i}
                  onSelect={() => setSelectedVariation(i)}
                  onTogglePlay={() =>
                    setPlayingVariation(playingVariation === i ? null : i)
                  }
                  onDownload={() => {
                    if (variation.audioUrl) {
                      window.open(variation.audioUrl, '_blank')
                    }
                  }}
                  onFavorite={() => {
                    setFavorites((prev) => {
                      const next = new Set(prev)
                      if (next.has(variation.id)) next.delete(variation.id)
                      else next.add(variation.id)
                      return next
                    })
                  }}
                  onRegenerate={handleGenerateSimilar}
                  isFavorited={favorites.has(variation.id)}
                />
              ))}
            </div>

            {/* Generate similar button */}
            <div className="mt-6">
              <button
                onClick={handleGenerateSimilar}
                className="font-sans text-sm text-sd-accent hover:text-accent-dim transition-colors"
              >
                Generate similar →
              </button>
            </div>
          </div>

          {/* Neighbors sidebar */}
          {sound.neighbors && sound.neighbors.length > 0 && (
            <div className="lg:w-72">
              <NeighborList neighbors={sound.neighbors} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
