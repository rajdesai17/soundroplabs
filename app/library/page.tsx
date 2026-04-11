'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { Search, Plus } from 'lucide-react'
import Navigation from '@/components/shared/Navigation'
import SoundCard from '@/components/shared/SoundCard'
import SignInModal from '@/components/shared/SignInModal'
import Toast, { useToast } from '@/components/shared/Toast'
import { SoundEntry, LibrarySoundEntry } from '@/lib/types'

// Empty state waveform SVG
function EmptyStateWaveform() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="mx-auto mb-6">
      <rect x="10" y="30" width="8" height="20" rx="2" fill="#1A1A1A" stroke="#2A2A2A" />
      <rect x="22" y="20" width="8" height="40" rx="2" fill="#1A1A1A" stroke="#2A2A2A" />
      <rect x="34" y="25" width="8" height="30" rx="2" fill="#1A1A1A" stroke="#2A2A2A" />
      <rect x="46" y="15" width="8" height="50" rx="2" fill="#1A1A1A" stroke="#2A2A2A" />
      <rect x="58" y="22" width="8" height="36" rx="2" fill="#1A1A1A" stroke="#2A2A2A" />
      <rect x="70" y="28" width="8" height="24" rx="2" fill="#1A1A1A" stroke="#2A2A2A" />
      <rect x="82" y="18" width="8" height="44" rx="2" fill="#1A1A1A" stroke="#2A2A2A" />
      <rect x="94" y="26" width="8" height="28" rx="2" fill="#1A1A1A" stroke="#2A2A2A" />
      <rect x="106" y="32" width="8" height="16" rx="2" fill="#1A1A1A" stroke="#2A2A2A" />
    </svg>
  )
}

export default function LibraryPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [showSignIn, setShowSignIn] = useState(false)
  const [savedSounds, setSavedSounds] = useState<LibrarySoundEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'most-played' | 'shortest' | 'longest'>('newest')
  const { toast, showToast, hideToast } = useToast()

  const isAuthenticated = !!session?.user

  // Fetch library when authenticated
  useEffect(() => {
    if (!isAuthenticated) return

    fetch('/api/library')
      .then((res) => res.json())
      .then((data) => {
        if (data.sounds) {
          setSavedSounds(
            data.sounds.map((s: any) => ({
              ...s,
              createdAt: new Date(s.createdAt),
              savedAt: new Date(s.savedAt),
            }))
          )
        }
      })
      .catch(() => {
        // Silently fail — empty library is fine
      })
  }, [isAuthenticated])

  // Filter and sort sounds
  const filteredSounds = useMemo(() => {
    let result = [...savedSounds]

    if (searchQuery) {
      result = result.filter((sound) =>
        sound.query.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime())
        break
      case 'most-played':
        result.sort((a, b) => b.playCount - a.playCount)
        break
      case 'shortest':
        result.sort((a, b) => a.duration - b.duration)
        break
      case 'longest':
        result.sort((a, b) => b.duration - a.duration)
        break
    }

    return result
  }, [savedSounds, searchQuery, sortBy])

  const handleDelete = (id: string) => {
    fetch(`/api/library?id=${id}`, { method: 'DELETE' })
      .catch(() => {}) // Best-effort
    setSavedSounds((prev) => prev.filter((s) => s.id !== id))
    showToast('Sound removed from library', 'success')
  }

  const handleNewSound = () => {
    router.push('/')
  }

  const user = session?.user
    ? {
        name: session.user.name ?? 'User',
        initials: (session.user.name ?? 'U').slice(0, 2).toUpperCase(),
      }
    : null

  // Not authenticated state
  if (!isAuthenticated && status !== 'loading') {
    return (
      <div className="min-h-screen bg-bg-base">
        <Navigation user={null} onSignInClick={() => setShowSignIn(true)} />

        <main className="flex items-center justify-center min-h-[calc(100vh-56px)] px-4">
          <div className="bg-bg-surface border border-border-default rounded-xl p-10 max-w-90 text-center">
            <h1 className="font-serif text-3xl text-text-primary mb-2">
              Save your sounds
            </h1>
            <p className="font-sans text-base text-text-secondary mb-6">
              Sign in to build your personal sound archive.
            </p>
            <button
              onClick={() => signIn('google')}
              className="w-full h-11 bg-text-primary text-bg-base font-sans text-sm font-medium rounded flex items-center justify-center gap-2 hover:bg-text-secondary transition-colors duration-150"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>
        </main>

        <SignInModal
          isOpen={showSignIn}
          onClose={() => setShowSignIn(false)}
          onSignIn={() => signIn('google')}
        />
      </div>
    )
  }

  // Authenticated state
  return (
    <div className="min-h-screen bg-bg-base">
      <Navigation user={user} onSignInClick={() => setShowSignIn(true)} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your sounds..."
                className="w-75 h-10 bg-bg-surface border border-border-default rounded pl-9 pr-3 font-sans text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-accent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-10 bg-bg-surface border border-border-default rounded px-3 font-sans text-sm text-text-primary focus:outline-none focus:border-border-accent appearance-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="most-played">Most played</option>
              <option value="shortest">Shortest</option>
              <option value="longest">Longest</option>
            </select>
          </div>
          <button
            onClick={handleNewSound}
            className="h-10 px-4 bg-sd-accent text-bg-base font-sans text-sm font-medium rounded flex items-center gap-2 hover:bg-accent-dim transition-colors"
          >
            <Plus size={16} />
            New sound
          </button>
        </div>

        {/* Content */}
        {savedSounds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <EmptyStateWaveform />
            <h2 className="font-serif text-3xl text-text-primary mb-2">
              No sounds yet
            </h2>
            <p className="font-sans text-base text-text-tertiary mb-6">
              Generate your first sound
            </p>
            <button
              onClick={handleNewSound}
              className="h-11 px-6 bg-sd-accent text-bg-base font-sans text-sm font-medium rounded hover:bg-accent-dim transition-colors"
            >
              Go generate
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredSounds.map((sound, index) => (
              <SoundCard
                key={sound.id}
                sound={sound}
                index={index}
                showDelete
                onDelete={handleDelete}
                showSavedDate
                savedDate={sound.savedAt}
              />
            ))}
          </div>
        )}
      </main>

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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
