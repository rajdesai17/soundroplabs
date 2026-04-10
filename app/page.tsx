'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/shared/Navigation'
import SignInModal from '@/components/shared/SignInModal'
import Toast, { useToast } from '@/components/shared/Toast'
import ZoneA from '@/components/home/ZoneA'
import ZoneB from '@/components/home/ZoneB'
import ZoneC from '@/components/home/ZoneC'
import { Zone, Variation, Neighbor, User } from '@/lib/types'
import { mockNeighbors, generateMockVariations } from '@/lib/mockData'

export default function HomePage() {
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
  const [user, setUser] = useState<User | null>(null)
  const { toast, showToast, hideToast } = useToast()

  // Handle query param for pre-filling search
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      // Auto-submit if coming from gallery
      handleSubmit(q)
    }
  }, [searchParams])

  const handleSubmit = useCallback(async (overrideQuery?: string) => {
    const searchQuery = overrideQuery || query
    if (!searchQuery.trim()) return

    // Transition A → B
    setIsExiting(true)
    setTimeout(() => {
      setZone('B')
      setIsExiting(false)
      setStage(0)
      setNeighbors(mockNeighbors)
    }, 250)

    // Simulate API call stages
    // Stage 0: Searching (already set)
    setTimeout(() => setStage(1), 1200) // Found neighbors
    setTimeout(() => setStage(2), 2400) // Building prompt
    setTimeout(() => setStage(3), 3600) // Generating

    // Complete after ~4s
    setTimeout(() => {
      setVariations(generateMockVariations())
      setZone('C')
    }, 4500)
  }, [query])

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
    
    // Show loading state briefly
    setVariations([])
    setTimeout(() => {
      setVariations(generateMockVariations())
    }, 1500)
  }, [query])

  const handleSignIn = useCallback(() => {
    // Mock sign in
    setUser({
      id: '1',
      email: 'user@example.com',
      name: 'Demo User',
      initials: 'DU',
    })
    setShowSignIn(false)
    showToast('Signed in successfully', 'success')
  }, [showToast])

  return (
    <div className="min-h-screen bg-bg-base">
      <Navigation 
        user={user} 
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
