'use client'

import SearchBar from './SearchBar'
import { examplePrompts } from '@/lib/mockData'

interface ZoneAProps {
  query: string
  onQueryChange: (query: string) => void
  duration: number | null
  onDurationChange: (duration: number | null) => void
  onSubmit: () => void
  isExiting?: boolean
}

export default function ZoneA({
  query,
  onQueryChange,
  duration,
  onDurationChange,
  onSubmit,
  isExiting = false,
}: ZoneAProps) {
  const handleExampleClick = (example: string) => {
    onQueryChange(example)
    // Auto-submit after a brief delay for better UX
    setTimeout(() => onSubmit(), 100)
  }

  return (
    <div 
      className={`min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-16 ${
        isExiting ? 'animate-fade-out-up' : 'animate-fade-in-up'
      }`}
    >
      {/* Tagline */}
      <p className="font-mono text-xs text-text-tertiary tracking-widest mb-4 uppercase">
        TURBOPUFFER + ELEVENLABS
      </p>

      {/* Hero Headlines */}
      <h1 className="font-serif text-5xl md:text-6xl text-text-primary text-center mb-1">
        Describe any sound.
      </h1>
      <h2 className="font-serif text-5xl md:text-6xl text-text-secondary italic text-center mb-6">
        Hear it instantly.
      </h2>

      {/* Subtitle */}
      <p className="font-sans text-lg text-text-tertiary text-center max-w-md mb-10 leading-relaxed">
        Stop hunting stock libraries.<br />
        Generate the exact sound you hear in your head.
      </p>

      {/* Search Bar */}
      <SearchBar
        value={query}
        onChange={onQueryChange}
        onSubmit={onSubmit}
        duration={duration}
        onDurationChange={onDurationChange}
      />

      {/* Example Chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-xl">
        {examplePrompts.map((example) => (
          <button
            key={example}
            onClick={() => handleExampleClick(example)}
            className="font-mono text-xs text-text-secondary border border-border-default px-3 py-1.5 rounded hover:bg-bg-elevated hover:border-border-hover hover:text-text-primary transition-colors duration-100"
          >
            {example}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-center gap-4 mt-12 font-mono text-sm text-text-tertiary">
        <span>24,891 sounds generated</span>
        <span className="text-text-ghost">·</span>
        <span>4.2s avg generation</span>
        <span className="text-text-ghost">·</span>
        <span>100% royalty-free</span>
      </div>
    </div>
  )
}
