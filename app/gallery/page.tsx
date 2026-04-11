'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Navigation from '@/components/shared/Navigation'
import SoundCard from '@/components/shared/SoundCard'
import SignInModal from '@/components/shared/SignInModal'
import { categories } from '@/lib/mockData'
import { Category, SoundEntry } from '@/lib/types'

export default function GalleryPage() {
  const { data: session } = useSession()
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const [showSignIn, setShowSignIn] = useState(false)
  const [sounds, setSounds] = useState<SoundEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch from API when category changes
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (activeCategory !== 'All') params.set('category', activeCategory)

    fetch(`/api/gallery?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setSounds(data.sounds ?? [])
      })
      .catch(() => {
        setSounds([])
      })
      .finally(() => setLoading(false))
  }, [activeCategory])

  // Filter sounds client-side as well for immediate feedback
  const filteredSounds = useMemo(() => {
    if (activeCategory === 'All') return sounds
    return sounds.filter((sound) => sound.category === activeCategory)
  }, [activeCategory, sounds])

  const user = session?.user
    ? {
        name: session.user.name ?? 'User',
        initials: (session.user.name ?? 'U').slice(0, 2).toUpperCase(),
      }
    : null

  return (
    <div className="min-h-screen bg-bg-base">
      <Navigation user={user} onSignInClick={() => setShowSignIn(true)} />

      {/* Mini Hero */}
      <section className="px-4 pt-14 pb-8 text-center">
        <p className="font-mono text-[10px] text-text-tertiary tracking-[0.25em] uppercase mb-3">
          GALLERY
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-text-primary mb-2">
          What people are creating
        </h1>
        <p className="font-sans text-sm text-text-secondary">
          Browse AI-generated sounds from the SoundDrop community
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-4">

        {/* Category Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide gap-1 mb-8 border-b border-border-default">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`font-sans text-sm px-4 py-2 whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeCategory === category
                  ? 'text-text-primary border-sd-accent'
                  : 'text-text-tertiary border-transparent hover:text-text-secondary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Main Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="bg-bg-surface border border-border-default rounded-lg h-48 animate-shimmer"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          ) : filteredSounds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredSounds.map((sound, index) => (
                <SoundCard key={sound.id} sound={sound} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-serif text-2xl text-text-primary mb-2">
                No sounds yet
              </p>
              <p className="font-sans text-text-secondary">
                Generate your first sound to see it here
              </p>
            </div>
          )}
        </section>
      </main>

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSignIn={() => signIn('google')}
      />
    </div>
  )
}
