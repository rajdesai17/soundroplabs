'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Pause, Download, Heart, RefreshCw } from 'lucide-react'
import WaveformThumbnail from './WaveformThumbnail'
import { formatDuration, playTone } from '@/lib/waveformUtils'
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
  const toneRef = useRef<{ stop: () => void } | null>(null)
  const progressRef = useRef<NodeJS.Timeout | null>(null)
  const resolvedUrlRef = useRef<string | null>(null)

  const isMockAudio = variation.audioUrl.startsWith('/mock-audio-')
  const isPrivateBlob = variation.audioUrl.includes('.blob.vercel-storage.com')

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      toneRef.current?.stop()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [])

  // Handle hover-to-play
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
    if (isPlaying) return

    if (isMockAudio) {
      // Fallback: play sine tone for mock audio
      const frequency = 220 + (variation.index - 1) * 110
      toneRef.current = playTone(frequency, variation.duration)

      setProgress(0)
      const interval = 50
      const increment = interval / (variation.duration * 1000)
      progressRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 1) {
            if (progressRef.current) clearInterval(progressRef.current)
            return 0
          }
          return prev + increment
        })
      }, interval)
    } else {
      // Real audio playback — resolve private blob URL if needed
      const playAudio = async () => {
        let url = variation.audioUrl
        if (isPrivateBlob && !resolvedUrlRef.current) {
          try {
            const res = await fetch(`/api/blob?url=${encodeURIComponent(url)}`)
            const data = await res.json()
            if (data.downloadUrl) {
              url = data.downloadUrl
              resolvedUrlRef.current = url
            }
          } catch {
            return // Can't resolve URL, skip playback
          }
        } else if (resolvedUrlRef.current) {
          url = resolvedUrlRef.current
        }

        if (!audioRef.current || audioRef.current.src !== url) {
          audioRef.current = new Audio(url)
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
        }

        audio.play().catch(() => {
          // Autoplay may be blocked; ignore
        })
      }
      playAudio()
    }
  }, [isPlaying, isMockAudio, isPrivateBlob, variation.audioUrl, variation.duration, variation.index])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    if (isPlaying) return

    if (isMockAudio) {
      toneRef.current?.stop()
      toneRef.current = null
    } else if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    if (progressRef.current) {
      clearInterval(progressRef.current)
      progressRef.current = null
    }
    setProgress(0)
  }, [isPlaying, isMockAudio])

  return (
    <div
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          onClick={(e) => {
            e.stopPropagation()
            onTogglePlay()
          }}
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
