'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, Play, Pause } from 'lucide-react'
import WaveformThumbnail from './WaveformThumbnail'
import { formatDuration, formatPlayCount } from '@/lib/waveformUtils'
import { SoundEntry, Category } from '@/lib/types'

function getPlayableUrl(audioUrl: string): string {
  if (audioUrl.includes('.blob.vercel-storage.com')) {
    return `/api/blob?url=${encodeURIComponent(audioUrl)}`
  }
  return audioUrl
}

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
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()

    if (!sound.audioUrl) return

    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
      return
    }

    if (!audioRef.current) {
      const url = getPlayableUrl(sound.audioUrl)
      audioRef.current = new Audio(url)
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current?.duration) {
          setProgress(audioRef.current.currentTime / audioRef.current.duration)
        }
      }
      audioRef.current.onended = () => {
        setIsPlaying(false)
        setProgress(0)
      }
      audioRef.current.onerror = () => {
        setIsPlaying(false)
        setProgress(0)
      }
    }

    audioRef.current.play().catch(() => {
      setIsPlaying(false)
    })
    setIsPlaying(true)
  }, [isPlaying, sound.audioUrl])

  const handleCardClick = () => {
    // Navigate to sound permalink page
    router.push(`/sound/${sound.id}`)
  }

  return (
    <div
      className={`relative bg-bg-surface border rounded-lg p-4 transition-colors duration-100 cursor-pointer ${
        isHovering ? 'border-border-hover' : 'border-border-default'
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleCardClick}
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
        <span className="font-mono text-[10px] tracking-wider text-text-tertiary border border-border-default px-2 py-0.5 rounded">
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
          progress={isPlaying ? progress : 0}
          barColor={isHovering ? '#444444' : '#2A2A2A'}
          progressColor="#E8F055"
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
          {/* Play button */}
          {sound.audioUrl && (
            <button
              onClick={togglePlay}
              className="w-6 h-6 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            </button>
          )}
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
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/sound/${sound.id}`)
          }}
          className="font-sans text-xs text-sd-accent hover:text-accent-dim transition-colors"
        >
          Open →
        </button>
      </div>
    </div>
  )
}
