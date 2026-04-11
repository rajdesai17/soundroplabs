'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { LayerType, SceneLayerResult } from '@/lib/scene-types'

function getPlayableUrl(audioUrl: string): string {
  if (audioUrl.includes('.blob.vercel-storage.com')) {
    return `/api/blob?url=${encodeURIComponent(audioUrl)}`
  }
  return audioUrl
}

interface TrackState {
  layerType: LayerType
  isPlaying: boolean
  progress: number
  duration: number
}

interface MixerControls {
  tracks: TrackState[]
  isPlaying: boolean
  masterProgress: number
  playAll: () => void
  pauseAll: () => void
  toggleTrack: (layerType: LayerType) => void
}

export function useSceneMixer(layers: SceneLayerResult[]): MixerControls {
  const audioRefs = useRef<Map<LayerType, HTMLAudioElement>>(new Map())
  const [tracks, setTracks] = useState<TrackState[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [masterProgress, setMasterProgress] = useState(0)
  const rafRef = useRef<number | null>(null)

  // Initialize audio elements when layers change
  useEffect(() => {
    const completedLayers = layers.filter(l => l.status === 'complete' && l.audioUrl)
    const currentMap = audioRefs.current

    // Clean up old elements
    for (const [type, audio] of currentMap.entries()) {
      if (!completedLayers.find(l => l.type === type)) {
        audio.pause()
        currentMap.delete(type)
      }
    }

    // Create new elements
    for (const layer of completedLayers) {
      if (!currentMap.has(layer.type) && layer.audioUrl) {
        const audio = new Audio(getPlayableUrl(layer.audioUrl))
        audio.preload = 'auto'
        currentMap.set(layer.type, audio)
      }
    }

    setTracks(
      completedLayers.map(l => ({
        layerType: l.type,
        isPlaying: false,
        progress: 0,
        duration: l.duration,
      }))
    )

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [layers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const audio of audioRefs.current.values()) {
        audio.pause()
      }
      audioRefs.current.clear()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Progress update loop
  const updateProgress = useCallback(() => {
    const map = audioRefs.current
    let maxDuration = 0
    let maxCurrent = 0

    setTracks(prev =>
      prev.map(t => {
        const audio = map.get(t.layerType)
        if (!audio) return t
        const dur = audio.duration || t.duration
        if (dur > maxDuration) maxDuration = dur
        if (audio.currentTime > maxCurrent) maxCurrent = audio.currentTime
        return {
          ...t,
          progress: dur > 0 ? audio.currentTime / dur : 0,
          isPlaying: !audio.paused,
        }
      })
    )

    if (maxDuration > 0) {
      setMasterProgress(maxCurrent / maxDuration)
    }

    // Check if all tracks are done
    let anyPlaying = false
    for (const audio of map.values()) {
      if (!audio.paused) {
        anyPlaying = true
        break
      }
    }

    if (anyPlaying) {
      rafRef.current = requestAnimationFrame(updateProgress)
    } else {
      setIsPlaying(false)
    }
  }, [])

  const playAll = useCallback(() => {
    const map = audioRefs.current
    // Sync all to time 0
    for (const audio of map.values()) {
      audio.currentTime = 0
    }
    // Play all
    for (const audio of map.values()) {
      audio.play().catch(() => {})
    }
    setIsPlaying(true)
    rafRef.current = requestAnimationFrame(updateProgress)
  }, [updateProgress])

  const pauseAll = useCallback(() => {
    for (const audio of audioRefs.current.values()) {
      audio.pause()
    }
    setIsPlaying(false)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const toggleTrack = useCallback((layerType: LayerType) => {
    const audio = audioRefs.current.get(layerType)
    if (!audio) return

    if (audio.paused) {
      audio.play().catch(() => {})
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updateProgress)
      }
    } else {
      audio.pause()
    }
  }, [updateProgress])

  return {
    tracks,
    isPlaying,
    masterProgress,
    playAll,
    pauseAll,
    toggleTrack,
  }
}
