'use client'

import { useState } from 'react'
import { exampleScenes } from '@/lib/mockData'

interface SceneInputProps {
  onSubmit: (description: string) => void
  isExiting?: boolean
}

export default function SceneInput({ onSubmit, isExiting = false }: SceneInputProps) {
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (description.trim()) {
      onSubmit(description.trim())
    }
  }

  return (
    <div
      className={`min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-16 ${
        isExiting ? 'animate-fade-out-up' : 'animate-fade-in-up'
      }`}
    >
      <p className="font-mono text-xs text-text-tertiary tracking-widest mb-4 uppercase">
        SCENE MODE
      </p>

      <h1 className="font-serif text-5xl md:text-6xl text-text-primary text-center mb-1">
        Describe a scene.
      </h1>
      <h2 className="font-serif text-5xl md:text-6xl text-text-secondary italic text-center mb-6">
        Hear every layer.
      </h2>

      <p className="font-sans text-lg text-text-tertiary text-center max-w-md mb-10 leading-relaxed">
        AI decomposes your scene into 4 sonic layers<br />
        and generates each one.
      </p>

      {/* Textarea */}
      <div className="w-full max-w-xl">
        <div className="relative border border-border-default rounded-lg bg-bg-surface focus-within:border-sd-accent focus-within:shadow-[0_0_0_1px_rgba(232,240,85,0.15)] transition-all">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="A tense interrogation room. Fluorescent light hum. Chair scraping. Distant footsteps. Building dread."
            rows={4}
            className="w-full bg-transparent font-sans text-base text-text-primary placeholder:text-text-ghost px-4 py-3 resize-none outline-none"
          />
          <div className="flex items-center justify-between px-4 pb-3">
            <span className="font-mono text-xs text-text-tertiary">
              {description.length} / 500
            </span>
            <button
              onClick={handleSubmit}
              disabled={!description.trim()}
              className="font-sans text-sm font-medium bg-sd-accent text-bg-base px-5 py-2 rounded transition-colors hover:bg-sd-accent-dim disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Compose Scene &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Example Chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-xl">
        {exampleScenes.map((scene) => (
          <button
            key={scene}
            onClick={() => {
              setDescription(scene)
              setTimeout(() => onSubmit(scene), 100)
            }}
            className="font-mono text-xs text-text-secondary border border-border-default px-3 py-1.5 rounded hover:bg-bg-elevated hover:border-border-hover hover:text-text-primary transition-colors duration-100"
          >
            {scene}
          </button>
        ))}
      </div>

      {/* Footer hint */}
      <p className="font-mono text-xs text-text-tertiary mt-12">
        4 layers &middot; 4 turbopuffer searches &middot; 1 scene
      </p>
    </div>
  )
}
