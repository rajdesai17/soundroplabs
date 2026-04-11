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

async function resolveAudioUrl(audioUrl: string): Promise<string> {
  if (audioUrl.includes('.blob.vercel-storage.com')) {
    const res = await fetch(`/api/blob?url=${encodeURIComponent(audioUrl)}`)
    const data = await res.json()
    return data.downloadUrl || audioUrl
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
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const toneRef = useRef<{ stop: () => void } | null>(null)
  const progressRef = useRef<NodeJS.Timeout | null>(null)
  const resolvedUrlRef = useRef<string | null>(null)

  const isMockAudio = variation.audioUrl.startsWith('/mock-audio-')

  // Preload: resolve the blob URL as soon as we get a real audioUrl
  useEffect(() => {
    if (!isMockAudio && !resolvedUrlRef.current) {
      resolveAudioUrl(variation.audioUrl).then(url => {
        resolvedUrlRef.current = url
      })
    }
  }, [variation.audioUrl, isMockAudio])

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

  const playAudio = useCallback(async () => {
    if (isMockAudio) {
      const frequency = 220 + (variation.index - 1) * 110
      toneRef.current = playTone(frequency, variation.duration)
      setIsAudioPlaying(true)

      setProgress(0)
      const interval = 50
      const increment = interval / (variation.duration * 1000)
      progressRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 1) {
            if (progressRef.current) clearInterval(progressRef.current)
            setIsAudioPlaying(false)
            return 0
          }
          return prev + increment
        })
      }, interval)
      return
    }

    // Real audio
    let url = resolvedUrlRef.current
    if (!url) {
      url = await resolveAudioUrl(variation.audioUrl)
      resolvedUrlRef.current = url
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(url)
    } else if (audioRef.current.src !== url) {
      audioRef.current.src = url
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
      setIsAudioPlaying(false)
    }
    audio.onerror = () => {
      console.error('Audio playback error for', url)
      setIsAudioPlaying(false)
    }

    try {
      await audio.play()
      setIsAudioPlaying(true)
    } catch (err) {
      console.error('Play failed:', err)
    }
  }, [isMockAudio, variation.audioUrl, variation.duration, variation.index])

  const pauseAudio = useCallback(() => {
    if (isMockAudio) {
      toneRef.current?.stop()
      toneRef.current = null
    } else if (audioRef.current) {
      audioRef.current.pause()
    }
    if (progressRef.current) {
      clearInterval(progressRef.current)
      progressRef.current = null
    }
    setIsAudioPlaying(false)
  }, [isMockAudio])

  // Play button click — this is user-initiated so browsers allow it
  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (isAudioPlaying) {
      pauseAudio()
    } else {
      playAudio()
    }
    onTogglePlay()
  }, [isAudioPlaying, playAudio, pauseAudio, onTogglePlay])

  // Hover-to-play: only works after user has interacted with the page
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
    if (!isAudioPlaying) {
      playAudio()
    }
  }, [isAudioPlaying, playAudio])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    if (isAudioPlaying && !isPlaying) {
      pauseAudio()
      setProgress(0)
      if (audioRef.current) audioRef.current.currentTime = 0
    }
  }, [isAudioPlaying, isPlaying, pauseAudio])

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
          onClick={handlePlayClick}
          className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          aria-label={isAudioPlaying ? 'Pause' : 'Play'}
        >
          {isAudioPlaying ? <Pause size={16} /> : <Play size={16} />}
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
