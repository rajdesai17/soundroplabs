'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Pause, Download, Heart, RefreshCw } from 'lucide-react'
import WaveformThumbnail from './WaveformThumbnail'
import { formatDuration } from '@/lib/waveformUtils'
import { Variation } from '@/lib/types'

interface VariationCardProps {
  variation: Variation
  isSelected: boolean
  isPlaying: boolean
  onSelect: () => void
  onTogglePlay: () => void
  onDownload: () => void
  onFavorite: () => void
  onRegenerate: () => void
  isFavorited?: boolean
}

function getPlayableUrl(audioUrl: string): string {
  if (audioUrl.includes('.blob.vercel-storage.com')) {
    return `/api/blob?url=${encodeURIComponent(audioUrl)}`
  }
  return audioUrl
}

export default function VariationCard({
  variation,
  isSelected,
  isPlaying,
  onSelect,
  onTogglePlay,
  onDownload,
  onFavorite,
  onRegenerate,
  isFavorited = false,
}: VariationCardProps) {
  const [progress, setProgress] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressRef = useRef<NodeJS.Timeout | null>(null)

  const isMockAudio = variation.audioUrl.startsWith('/mock-audio-')
  const playableUrl = isMockAudio ? variation.audioUrl : getPlayableUrl(variation.audioUrl)

  // Stop playback when parent says we're no longer the playing card
  useEffect(() => {
    if (!isPlaying && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setProgress(0)
    }
  }, [isPlaying])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [])

  // Play button click — user-initiated, always allowed by browser
  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()

    if (isPlaying) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause()
      }
      onTogglePlay()
      return
    }

    // This calls onTogglePlay which tells the parent to set this as playing
    // and stop any other playing card
    onTogglePlay()

    if (isMockAudio) return

    if (!audioRef.current) {
      audioRef.current = new Audio(playableUrl)
    } else if (!audioRef.current.src.endsWith(playableUrl)) {
      audioRef.current.src = playableUrl
    }

    const audio = audioRef.current
    audio.currentTime = 0

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration)
      }
    }
    audio.onended = () => {
      setProgress(0)
      onTogglePlay() // Tell parent we stopped
    }
    audio.onerror = () => {
      console.error('Audio playback error')
      setProgress(0)
    }

    audio.play().catch(err => {
      console.error('Play failed:', err)
    })
  }, [isPlaying, isMockAudio, playableUrl, onTogglePlay])

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative bg-bg-surface border rounded-lg p-3 cursor-pointer transition-colors duration-100 ${
        isSelected
          ? 'border-border-accent bg-[#0F0F05]'
          : isHovering
          ? 'border-border-hover'
          : 'border-border-default'
      }`}
    >
      {/* Waveform */}
      <div className="mb-2">
        <WaveformThumbnail
          data={variation.waveformData}
          width={280}
          height={56}
          progress={progress}
          barColor="#2A2A2A"
          progressColor="#E8F055"
        />
      </div>

      {/* Duration */}
      <div className="text-right mb-2">
        <span className="font-mono text-xs text-text-tertiary">
          {formatDuration(variation.duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePlayClick}
          className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onDownload()
          }}
          className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Download"
        >
          <Download size={16} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onFavorite()
          }}
          className={`w-8 h-8 flex items-center justify-center transition-colors ${
            isFavorited ? 'text-sd-accent' : 'text-text-secondary hover:text-text-primary'
          }`}
          aria-label="Favorite"
        >
          <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onRegenerate()
          }}
          className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Regenerate"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Label and keyboard hint */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-default">
        <span className="font-mono text-xs text-text-tertiary">
          Variation {variation.index}
        </span>
        <span className="font-mono text-xs text-text-tertiary px-1.5 py-0.5 bg-bg-elevated rounded">
          {variation.index}
        </span>
      </div>
    </div>
  )
}

// Ghost/loading version of the card
export function VariationCardGhost({ index }: { index: number }) {
  return (
    <div
      className="bg-bg-surface border border-bg-elevated rounded-lg h-36 animate-shimmer"
      style={{ animationDelay: `${index * 200}ms` }}
    />
  )
}
