'use client'

import { useState, useEffect } from 'react'
import { Neighbor } from '@/lib/types'
import { VariationCardGhost } from '../shared/VariationCard'

interface ZoneBProps {
  query: string
  neighbors: Neighbor[]
  stage: number // 0-3
  onComplete: () => void
}

const statusMessages = [
  'Searching 50,000 sounds...',
  'Found 8 acoustic neighbors...',
  'Building generation prompt...',
  'Generating 4 variations...',
]

export default function ZoneB({ query, neighbors, stage, onComplete }: ZoneBProps) {
  const [visibleNeighbors, setVisibleNeighbors] = useState<number>(0)

  // Stagger neighbor appearance when stage reaches 1
  useEffect(() => {
    if (stage >= 1 && visibleNeighbors < neighbors.length) {
      const timer = setTimeout(() => {
        setVisibleNeighbors((prev) => prev + 1)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [stage, visibleNeighbors, neighbors.length])

  // Calculate progress bar width based on stage
  const progressWidth = ((stage + 1) / 4) * 100

  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-12 animate-fade-in-up">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column (60%) */}
          <div className="flex-1 lg:w-3/5">
            {/* Query Echo */}
            <p className="font-mono text-sm text-text-tertiary mb-6 line-clamp-2">
              {`"${query}"`}
            </p>

            {/* Progress Bar */}
            <div className="w-full h-0.5 bg-bg-elevated rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-sd-accent transition-all duration-500 ease-out"
                style={{ width: `${progressWidth}%` }}
              />
            </div>

            {/* Status Text */}
            <p className="font-mono text-sm text-text-secondary mb-8">
              {statusMessages[stage]}
              <span className="animate-blink">_</span>
            </p>

            {/* Neighbor List */}
            {stage >= 1 && (
              <div className="space-y-2">
                {neighbors.slice(0, visibleNeighbors).map((neighbor, index) => (
                  <div
                    key={neighbor.id}
                    className="animate-slide-in-left"
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      opacity: index < visibleNeighbors - 2 ? 0.6 : 1 
                    }}
                  >
                    <span className="font-mono text-xs text-text-tertiary">
                      ∙ {neighbor.title.slice(0, 40)} — {neighbor.score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column (40%) */}
          <div className="lg:w-2/5">
            <p className="font-mono text-[10px] text-text-ghost tracking-wider mb-3 uppercase">
              VARIATIONS
            </p>

            {/* 2x2 Ghost Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((index) => (
                <VariationCardGhost key={index} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
