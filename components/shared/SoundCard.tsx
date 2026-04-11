'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import WaveformThumbnail from './WaveformThumbnail'
import { formatDuration, formatPlayCount, playTone } from '@/lib/waveformUtils'
import { getCardFrequency } from '@/lib/mockData'
import { SoundEntry, Category } from '@/lib/types'

interface SoundCardProps {
  sound: SoundEntry
  index: number
  showDelete?: boolean
  onDelete?: (id: string) => void
  showSavedDate?: boolean
  savedDate?: Date
}

export default function SoundCard({
  sound,
  index,
  showDelete = false,
  onDelete,
  showSavedDate = false,
  savedDate,
}: SoundCardProps) {
  const router = useRouter()
  const [isHovering, setIsHovering] = useState(false)
  const toneRef = useRef<{ stop: () => void } | null>(null)

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
    // Play demo tone
    const frequency = getCardFrequency(index)
    toneRef.current = playTone(frequency, sound.duration)
  }, [index, sound.duration])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    toneRef.current?.stop()
    toneRef.current = null
  }, [])

  const handleTryClick = () => {
    // Navigate to home with query pre-filled
    const params = new URLSearchParams({ q: sound.query })
    router.push(`/sfx?${params.toString()}`)
  }

  const getCategoryBadgeClass = (category: Category) => {
    return 'font-mono text-[10px] tracking-wider text-text-tertiary border border-border-default px-2 py-0.5 rounded'
  }

  return (
    <div
      className={`relative bg-bg-surface border rounded-lg p-4 transition-colors duration-100 ${
        isHovering ? 'border-border-hover' : 'border-border-default'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Delete button (Library only) */}
      {showDelete && isHovering && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(sound.id)
          }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-bg-elevated border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors z-10"
        >
          <X size={14} />
        </button>
      )}

      {/* Category Badge */}
      <div className="mb-3">
        <span className={getCategoryBadgeClass(sound.category)}>
          {sound.category.toUpperCase()}
        </span>
      </div>

      {/* Query text */}
      <p className="font-sans text-sm text-text-primary line-clamp-2 mb-4 min-h-10">
        {`"${sound.query}"`}
      </p>

      {/* Waveform */}
      <div className="mb-4">
        <WaveformThumbnail
          data={sound.waveformData}
          width={280}
          height={40}
          animated={isHovering}
          barColor={isHovering ? '#444444' : '#2A2A2A'}
        />
      </div>

      {/* Creator */}
      {sound.creatorName && (
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-4 h-4 rounded-full bg-bg-elevated flex items-center justify-center">
            <span className="font-mono text-[8px] text-text-tertiary">
              {sound.creatorName.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-mono text-[10px] text-text-tertiary">
            {sound.creatorName}
          </span>
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs text-text-tertiary">
          <span>{formatDuration(sound.duration)}</span>
          {!showSavedDate && (
            <>
              <span className="text-text-ghost">·</span>
              <span>{formatPlayCount(sound.playCount)} plays</span>
            </>
          )}
          {showSavedDate && savedDate && (
            <>
              <span className="text-text-ghost">·</span>
              <span>Saved {savedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </>
          )}
        </div>
        <button
          onClick={handleTryClick}
          className="font-sans text-xs text-sd-accent hover:text-accent-dim transition-colors"
        >
          Try this →
        </button>
      </div>
    </div>
  )
}
