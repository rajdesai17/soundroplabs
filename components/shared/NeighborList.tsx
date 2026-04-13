'use client'

import { useState } from 'react'
import { Neighbor } from '@/lib/types'

interface NeighborListProps {
  neighbors: Neighbor[]
  animating?: boolean
}

export default function NeighborList({ neighbors, animating = false }: NeighborListProps) {
  return (
    <div className="space-y-3">
      {neighbors.map((neighbor, index) => (
        <NeighborRow 
          key={neighbor.id} 
          neighbor={neighbor} 
          index={index}
          animating={animating}
        />
      ))}
      
      {/* Footer */}
      <div className="pt-4 text-right">
        <p className="font-mono text-[10px] text-text-ghost">turbopuffer semantic search</p>
        <p className="font-mono text-[10px] text-text-ghost">26,264 Freesound descriptions indexed</p>
      </div>
    </div>
  )
}

interface NeighborRowProps {
  neighbor: Neighbor
  index: number
  animating?: boolean
}

function NeighborRow({ neighbor, index, animating }: NeighborRowProps) {
  const [isHovering, setIsHovering] = useState(false)
  
  // Calculate bar width based on score (max 120px)
  const barWidth = (neighbor.score / 100) * 120

  return (
    <div 
      className={`${animating ? 'animate-slide-in-left' : ''}`}
      style={animating ? { animationDelay: `${index * 150}ms` } : {}}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex items-center gap-3">
        {/* Similarity bar */}
        <div className="w-30 h-1 bg-bg-elevated rounded-full overflow-hidden">
          <div 
            className="h-full bg-sd-accent rounded-full"
            style={{ width: `${barWidth}px` }}
          />
        </div>
        
        {/* Score */}
        <span className="font-mono text-xs text-text-tertiary w-8">
          {neighbor.score}%
        </span>
        
        {/* Title */}
        <span className={`font-sans text-sm truncate transition-colors ${isHovering ? 'text-text-primary' : 'text-text-secondary'}`}>
          {neighbor.title.length > 35 ? neighbor.title.slice(0, 35) + '...' : neighbor.title}
        </span>
      </div>
      
      {/* Description on hover */}
      {isHovering && (
        <p className="mt-1 ml-40 font-mono text-xs text-text-tertiary animate-fade-in-up">
          {neighbor.description}
        </p>
      )}
    </div>
  )
}
