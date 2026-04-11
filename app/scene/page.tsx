'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Navigation from '@/components/shared/Navigation'
import SignInModal from '@/components/shared/SignInModal'
import Toast, { useToast } from '@/components/shared/Toast'
import SceneInput from '@/components/scene/SceneInput'
import SceneGenerating from '@/components/scene/SceneGenerating'
import SceneResults from '@/components/scene/SceneResults'
import { useSceneStream } from '@/hooks/use-scene-stream'
import type { SceneLayerSpec, SceneLayerResult, SceneSSEEvent, LayerType } from '@/lib/scene-types'

type SceneZone = 'input' | 'generating' | 'results'

export default function ScenePage() {
  const [zone, setZone] = useState<SceneZone>('input')
  const [description, setDescription] = useState('')
  const [layerSpecs, setLayerSpecs] = useState<SceneLayerSpec[]>([])
  const [layerResults, setLayerResults] = useState<Map<LayerType, SceneLayerResult>>(new Map())
  const [isExiting, setIsExiting] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const { data: session } = useSession()
  const { toast, showToast, hideToast } = useToast()
  const { startStream, cancel } = useSceneStream()

  const handleEvent = useCallback((event: SceneSSEEvent) => {
    switch (event.type) {
      case 'decomposition':
        setLayerSpecs(event.layers)
        // Initialize all layers as pending
        setLayerResults(prev => {
          const next = new Map(prev)
          for (const spec of event.layers) {
            next.set(spec.type, {
              type: spec.type,
              query: spec.query,
              enrichedPrompt: null,
              neighbors: [],
              audioUrl: null,
              waveformData: [],
              duration: spec.type === 'music' ? 30 : 10,
              status: 'pending',
            })
          }
          return next
        })
        break

      case 'layer-start':
        setLayerResults(prev => {
          const next = new Map(prev)
          const existing = next.get(event.layerType)
          if (existing) {
            next.set(event.layerType, { ...existing, status: 'generating' })
          }
          return next
        })
        break

      case 'layer-neighbors':
        setLayerResults(prev => {
          const next = new Map(prev)
          const existing = next.get(event.layerType)
          if (existing) {
            next.set(event.layerType, {
              ...existing,
              neighbors: event.neighbors,
              latencyMs: event.latencyMs,
            })
          }
          return next
        })
        break

      case 'layer-complete':
        setLayerResults(prev => {
          const next = new Map(prev)
          const existing = next.get(event.layerType)
          if (existing) {
            next.set(event.layerType, {
              ...existing,
              status: 'complete',
              audioUrl: event.audioUrl,
              waveformData: event.waveformData,
              duration: event.duration,
            })
          }
          return next
        })
        break

      case 'layer-error':
        setLayerResults(prev => {
          const next = new Map(prev)
          const existing = next.get(event.layerType)
          if (existing) {
            next.set(event.layerType, {
              ...existing,
              status: 'error',
              error: event.message,
            })
          }
          return next
        })
        break

      case 'complete':
        setZone('results')
        break

      case 'error':
        showToast(event.message || 'Scene generation failed', 'error')
        setZone('input')
        break
    }
  }, [showToast])

  const handleSubmit = useCallback((desc: string) => {
    setDescription(desc)
    setIsExiting(true)
    setTimeout(() => {
      setZone('generating')
      setIsExiting(false)
      setLayerSpecs([])
      setLayerResults(new Map())

      startStream(
        desc,
        handleEvent,
        (msg) => {
          showToast(msg, 'error')
          setZone('input')
        },
        () => {
          // Stream done — if we haven't transitioned to results yet
          // (e.g., all layers errored but 'complete' was still sent)
        }
      )
    }, 250)
  }, [startStream, handleEvent, showToast])

  const handleNewScene = useCallback(() => {
    cancel()
    setIsExiting(true)
    setTimeout(() => {
      setZone('input')
      setIsExiting(false)
      setDescription('')
      setLayerSpecs([])
      setLayerResults(new Map())
    }, 250)
  }, [cancel])

  const layersArray = Array.from(layerResults.values())

  return (
    <div className="min-h-screen bg-bg-base">
      <Navigation
        user={session?.user ? {
          name: session.user.name ?? 'User',
          initials: (session.user.name ?? 'U').slice(0, 2).toUpperCase(),
        } : null}
        onSignInClick={() => setShowSignIn(true)}
      />

      {zone === 'input' && (
        <SceneInput onSubmit={handleSubmit} isExiting={isExiting} />
      )}

      {zone === 'generating' && (
        <SceneGenerating
          description={description}
          layerSpecs={layerSpecs}
          layerResults={layerResults}
        />
      )}

      {zone === 'results' && (
        <SceneResults
          description={description}
          layers={layersArray}
          onNewScene={handleNewScene}
        />
      )}

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSignIn={() => {}}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  )
}
