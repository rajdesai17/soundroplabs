'use client'

import { useState, useEffect, useRef } from 'react'
import DurationPopover from '../shared/DurationPopover'
import { examplePrompts } from '@/lib/mockData'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  duration: number | null
  onDurationChange: (value: number | null) => void
  isLoading?: boolean
}

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  duration,
  onDurationChange,
  isLoading = false,
}: SearchBarProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [placeholderOpacity, setPlaceholderOpacity] = useState(1)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cycle placeholders every 3s with crossfade
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderOpacity(0)
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % examplePrompts.length)
        setPlaceholderOpacity(1)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim() && !isLoading) {
      onSubmit()
    }
  }

  return (
    <div className="w-full max-w-160 mx-auto">
      <div className="relative h-15 bg-bg-surface border border-border-default rounded-lg focus-within:border-border-accent focus-within:shadow-[0_0_0_3px_rgba(232,240,85,0.06)] transition-all">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="w-full h-full bg-transparent pl-5 pr-44 font-sans text-base text-text-primary placeholder:text-text-tertiary focus:outline-none disabled:opacity-50"
          style={{ 
            '--placeholder-opacity': placeholderOpacity 
          } as React.CSSProperties}
          placeholder={examplePrompts[placeholderIndex]}
        />
        
        {/* Right side controls */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <DurationPopover value={duration} onChange={onDurationChange} />
          <button
            onClick={onSubmit}
            disabled={!value.trim() || isLoading}
            className="h-11 px-5 bg-sd-accent text-bg-base font-sans text-sm font-medium rounded hover:bg-accent-dim transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Generate →'}
          </button>
        </div>
      </div>

      {/* Character count */}
      <div className="mt-2 text-left">
        <span className="font-mono text-xs text-text-tertiary">
          {value.length} / 300
        </span>
      </div>
    </div>
  )
}
