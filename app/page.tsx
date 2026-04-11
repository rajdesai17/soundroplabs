'use client'

import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import Navigation from '@/components/shared/Navigation'
import SignInModal from '@/components/shared/SignInModal'
import Toast, { useToast } from '@/components/shared/Toast'
import ZoneA from '@/components/home/ZoneA'
import ZoneB from '@/components/home/ZoneB'
import ZoneC from '@/components/home/ZoneC'
import { Zone, Variation, Neighbor } from '@/lib/types'

export default function HomePage() {
  return (
    <Suspense>
      <HomePageInner />
    </Suspense>
  )
}

function HomePageInner() {
  const searchParams = useSearchParams()
  
  // State
  const [zone, setZone] = useState<Zone>('A')
  const [query, setQuery] = useState('')
  const [duration, setDuration] = useState<number | null>(null)
  const [stage, setStage] = useState(0)
  const [neighbors, setNeighbors] = useState<Neighbor[]>([])
  const [variations, setVariations] = useState<Variation[]>([])
  const [isExiting, setIsExiting] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const { data: session } = useSession()
  const { toast, showToast, hideToast } = useToast()
  const eventSourceRef = useRef<EventSource | null>(null)

  // Clean up EventSource on unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close()
    }
  }, [])

  // Handle query param for pre-filling search
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      handleSubmit(q)
    }
  }, [searchParams])

  const startGeneration = useCallback((searchQuery: string, currentDuration: number | null) => {
    // Close any existing stream
    eventSourceRef.current?.close()

    const params = new URLSearchParams({ query: searchQuery })
    if (currentDuration != null) params.set('duration', String(currentDuration))

    const es = new EventSource(`/api/generate?${params}`)
    eventSourceRef.current = es

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.error) {
          showToast(data.message || 'Generation failed', 'error')
          setZone('A')
          es.close()
          return
        }

        switch (data.stage) {
          case 0:
            setStage(0)
            break
          case 1:
            setStage(1)
            if (data.neighbors) setNeighbors(data.neighbors)
            break
          case 2:
            setStage(2)
            break
          case 3:
            setStage(3)
            break
          case 4:
            if (data.variations) setVariations(data.variations)
            setZone('C')
            es.close()
            break
        }
      } catch {
        // Ignore parse errors on individual messages
      }
    }

    es.onerror = () => {
      es.close()
      showToast('Connection lost. Please try again.', 'error')
      setZone('A')
      setIsExiting(false)
    }
  }, [showToast])

  const handleSubmit = useCallback(async (overrideQuery?: string) => {
    const searchQuery = overrideQuery || query
    if (!searchQuery.trim()) return

    // Transition A → B
    setIsExiting(true)
    setTimeout(() => {
      setZone('B')
      setIsExiting(false)
      setStage(0)
      setNeighbors([])
      startGeneration(searchQuery, duration)
    }, 250)
  }, [query, duration, startGeneration])

  const handleNewSearch = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      setZone('A')
      setIsExiting(false)
      setQuery('')
      setStage(0)
      setNeighbors([])
      setVariations([])
    }, 250)
  }, [])

  const handleRefine = useCallback((modifier: string) => {
    const refinedQuery = modifier === 'Try again'
      ? query
      : `${query} (${modifier.toLowerCase()})`

    setQuery(refinedQuery)
    setVariations([]) // Shows ghost cards inline in Zone C
    startGeneration(refinedQuery, duration)
  }, [query, duration, startGeneration])

  const handleSignIn = useCallback(() => {
    signIn('google')
  }, [])

  return (
    <div className="min-h-screen bg-bg-base">
      <Navigation
        user={session?.user ? {
          name: session.user.name ?? 'User',
          initials: (session.user.name ?? 'U').slice(0, 2).toUpperCase(),
        } : null}
        onSignInClick={() => setShowSignIn(true)}
      />

      {zone === 'A' && (
        <ZoneA
          query={query}
          onQueryChange={setQuery}
          duration={duration}
          onDurationChange={setDuration}
          onSubmit={() => handleSubmit()}
          isExiting={isExiting}
        />
      )}

      {zone === 'B' && (
        <ZoneB
          query={query}
          neighbors={neighbors}
          stage={stage}
          onComplete={() => setZone('C')}
        />
      )}

      {zone === 'C' && (
        <ZoneC
          query={query}
          variations={variations}
          neighbors={neighbors}
          onNewSearch={handleNewSearch}
          onRefine={handleRefine}
        />
      )}

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSignIn={handleSignIn}
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
