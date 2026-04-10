'use client'

import { useState, useMemo } from 'react'
import Navigation from '@/components/shared/Navigation'
import SoundCard from '@/components/shared/SoundCard'
import SignInModal from '@/components/shared/SignInModal'
import { mockGalleryData, categories } from '@/lib/mockData'
import { Category, User } from '@/lib/types'

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const [showSignIn, setShowSignIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Filter sounds by category
  const filteredSounds = useMemo(() => {
    if (activeCategory === 'All') return mockGalleryData
    return mockGalleryData.filter((sound) => sound.category === activeCategory)
  }, [activeCategory])

  // Get trending sounds (top 5 by play count)
  const trendingSounds = useMemo(() => {
    return [...mockGalleryData]
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 5)
  }, [])

  const handleSignIn = () => {
    setUser({
      id: '1',
      email: 'user@example.com',
      name: 'Demo User',
      initials: 'DU',
    })
    setShowSignIn(false)
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <Navigation user={user} onSignInClick={() => setShowSignIn(true)} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-text-primary mb-2">
            What people are hearing
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-sd-accent animate-pulse" />
            <span className="font-mono text-xs text-text-secondary">
              ↑ 3 new sounds in the last hour
            </span>
          </div>
        </div>

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

        {/* Trending Section */}
        <section className="mb-10">
          <h2 className="font-mono text-[10px] text-text-tertiary tracking-wider uppercase mb-3">
            TRENDING THIS WEEK
          </h2>
          <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 -mx-4 px-4">
            {trendingSounds.map((sound, index) => (
              <div key={sound.id} className="min-w-55 flex-shrink-0">
                <SoundCard sound={sound} index={index} />
              </div>
            ))}
          </div>
        </section>

        {/* Main Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredSounds.map((sound, index) => (
              <SoundCard key={sound.id} sound={sound} index={index} />
            ))}
          </div>

          {filteredSounds.length === 0 && (
            <div className="text-center py-16">
              <p className="font-serif text-2xl text-text-primary mb-2">
                No sounds found
              </p>
              <p className="font-sans text-text-secondary">
                Try selecting a different category
              </p>
            </div>
          )}
        </section>
      </main>

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSignIn={handleSignIn}
      />
    </div>
  )
}
