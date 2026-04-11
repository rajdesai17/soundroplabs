'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { ArrowRight, Zap, Layers, Music, Search, Cpu, Download } from 'lucide-react'
import Navigation from '@/components/shared/Navigation'
import SignInModal from '@/components/shared/SignInModal'

// Deterministic pseudo-random for SSR hydration safety
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

function AnimatedWaveformHero() {
  return (
    <svg
      viewBox="0 0 800 120"
      className="w-full max-w-2xl h-16 md:h-20 opacity-20"
      preserveAspectRatio="none"
    >
      {Array.from({ length: 60 }, (_, i) => {
        const height = 20 + Math.sin(i * 0.3) * 40 + seededRandom(i) * 30
        return (
          <rect
            key={i}
            x={i * 13.3}
            y={60 - height / 2}
            width={8}
            height={height}
            rx={4}
            fill="#E8F055"
            opacity={0.3 + Math.sin(i * 0.2) * 0.3}
            className="waveform-bar"
          />
        )
      })}
    </svg>
  )
}

const FEATURES = [
  {
    icon: Search,
    title: 'Semantic Search',
    description: '26,000+ indexed sounds from Freesound, searchable by meaning — not just keywords.',
  },
  {
    icon: Zap,
    title: 'Turbopuffer RAG',
    description: 'Vector search finds 8 acoustic neighbors in ~20ms. Real sounds ground every generation.',
  },
  {
    icon: Cpu,
    title: 'AI Prompt Enrichment',
    description: 'Gemini 2.0 Flash transforms your words into detailed acoustic descriptions.',
  },
  {
    icon: Music,
    title: 'ElevenLabs Generation',
    description: 'Sound Effects API for SFX, Music API for instrumental beds. Both in one workflow.',
  },
  {
    icon: Layers,
    title: 'Scene Decomposition',
    description: 'Describe a scene — AI splits it into 4 sonic layers and generates each one.',
  },
  {
    icon: Download,
    title: 'Export & Play',
    description: 'Play all layers simultaneously. Download individual tracks or export as ZIP.',
  },
]

export default function LandingPage() {
  const { data: session } = useSession()
  const [showSignIn, setShowSignIn] = useState(false)

  return (
    <div className="min-h-screen bg-bg-base">
      <Navigation
        user={session?.user ? {
          name: session.user.name ?? 'User',
          initials: (session.user.name ?? 'U').slice(0, 2).toUpperCase(),
        } : null}
        onSignInClick={() => setShowSignIn(true)}
      />

      {/* ───── HERO ───── */}
      <section className="relative min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
        {/* Subtle background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(232,240,85,0.04) 0%, transparent 70%)',
          }}
        />

        <p className="font-mono text-[10px] text-text-tertiary tracking-[0.25em] mb-8 uppercase animate-fade-in-up relative z-10">
          AI-POWERED SOUND DESIGN
        </p>

        <h1
          className="font-serif text-6xl md:text-8xl text-text-primary text-center mb-2 leading-[0.95] animate-fade-in-up relative z-10"
          style={{ animationDelay: '100ms' }}
        >
          SoundDrop
        </h1>
        <p
          className="font-serif text-3xl md:text-5xl text-text-secondary italic text-center mb-8 animate-fade-in-up relative z-10"
          style={{ animationDelay: '200ms' }}
        >
          Describe it. Hear it.
        </p>

        <div className="animate-fade-in-up relative z-10" style={{ animationDelay: '300ms' }}>
          <AnimatedWaveformHero />
        </div>

        <p
          className="font-sans text-lg md:text-xl text-text-tertiary text-center max-w-lg mt-8 mb-12 leading-relaxed animate-fade-in-up relative z-10"
          style={{ animationDelay: '400ms' }}
        >
          Generate sound effects and full scene soundscapes
          with AI, grounded in 26,000 real-world sounds.
        </p>

        {/* ───── TWO CTAs ───── */}
        <div
          className="flex flex-col sm:flex-row gap-4 animate-fade-in-up relative z-10"
          style={{ animationDelay: '500ms' }}
        >
          <Link
            href="/sfx"
            className="group flex items-center gap-3 bg-sd-accent text-bg-base font-sans text-base font-medium px-8 py-4 rounded-lg transition-all hover:bg-sd-accent-dim hover:gap-4"
          >
            <Zap size={18} />
            Generate Sound Effects
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/scene"
            className="group flex items-center gap-3 border border-border-default text-text-primary font-sans text-base font-medium px-8 py-4 rounded-lg transition-all hover:border-sd-accent hover:gap-4"
          >
            <Layers size={18} />
            Design a Scene
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in-up"
          style={{ animationDelay: '800ms' }}
        >
          <div className="w-5 h-8 border border-border-default rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-text-tertiary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="px-4 py-24 border-t border-border-default">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[10px] text-text-tertiary tracking-[0.25em] uppercase mb-4 text-center">
            HOW IT WORKS
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-text-primary text-center mb-16">
            From words to waveforms
          </h2>

          {/* Pipeline steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-3">
            {[
              { step: '01', label: 'Describe', detail: 'Type what you hear in your head', color: '#E8F055' },
              { step: '02', label: 'Search', detail: '8 acoustic neighbors in ~20ms via turbopuffer', color: '#4A9EFF' },
              { step: '03', label: 'Enrich', detail: 'Gemini adds acoustic detail to your prompt', color: '#8B5CF6' },
              { step: '04', label: 'Generate', detail: 'ElevenLabs creates the exact sound', color: '#F59E0B' },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {/* Connector line (desktop) */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-6 right-0 w-full h-px bg-border-default -mr-1.5 z-0" />
                )}
                <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
                  <span
                    className="font-mono text-[10px] tracking-wider mb-2"
                    style={{ color: item.color }}
                  >
                    {item.step}
                  </span>
                  <h3 className="font-sans text-lg text-text-primary font-medium mb-1">
                    {item.label}
                  </h3>
                  <p className="font-sans text-sm text-text-tertiary max-w-[200px]">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── TWO MODES ───── */}
      <section className="px-4 py-24 border-t border-border-default">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[10px] text-text-tertiary tracking-[0.25em] uppercase mb-4 text-center">
            TWO MODES
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-text-primary text-center mb-16">
            One sound or an entire scene
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SFX Card */}
            <Link
              href="/sfx"
              className="group relative bg-bg-surface border border-border-default rounded-xl p-8 transition-all hover:border-sd-accent hover:bg-[#0F0F05]"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-sd-accent" />
                <span className="font-mono text-[10px] text-sd-accent tracking-wider uppercase">
                  SFX MODE
                </span>
              </div>
              <h3 className="font-serif text-2xl text-text-primary mb-3">
                Sound Effects
              </h3>
              <p className="font-sans text-sm text-text-secondary leading-relaxed mb-6">
                Describe a single sound — get 4 unique variations plus an optional music bed.
                Perfect for specific sound effects: footsteps, impacts, ambiences, UI sounds.
              </p>
              <div className="font-sans text-sm text-text-tertiary">
                <span className="inline-flex items-center gap-1">
                  4 variations
                  <span className="text-text-ghost mx-1">&middot;</span>
                  Music bed
                  <span className="text-text-ghost mx-1">&middot;</span>
                  Waveform preview
                </span>
              </div>
              <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={20} className="text-sd-accent" />
              </div>
            </Link>

            {/* Scene Card */}
            <Link
              href="/scene"
              className="group relative bg-bg-surface border border-border-default rounded-xl p-8 transition-all hover:border-[#4A9EFF] hover:bg-[#050A0F]"
            >
              <div className="flex items-center gap-2 mb-4">
                <Layers size={16} className="text-[#4A9EFF]" />
                <span className="font-mono text-[10px] text-[#4A9EFF] tracking-wider uppercase">
                  SCENE MODE
                </span>
              </div>
              <h3 className="font-serif text-2xl text-text-primary mb-3">
                Scene Design
              </h3>
              <p className="font-sans text-sm text-text-secondary leading-relaxed mb-6">
                Describe a full scene — AI decomposes it into ambience, foreground,
                background, and music. Each layer gets its own RAG pipeline.
              </p>
              <div className="font-sans text-sm text-text-tertiary">
                <span className="inline-flex items-center gap-1">
                  4 layers
                  <span className="text-text-ghost mx-1">&middot;</span>
                  DAW mixer
                  <span className="text-text-ghost mx-1">&middot;</span>
                  ZIP export
                </span>
              </div>
              <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={20} className="text-[#4A9EFF]" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section className="px-4 py-24 border-t border-border-default">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[10px] text-text-tertiary tracking-[0.25em] uppercase mb-4 text-center">
            UNDER THE HOOD
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-text-primary text-center mb-16">
            Built on real sound data
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="border border-border-default rounded-lg p-6 transition-colors hover:border-border-hover"
              >
                <feature.icon size={20} className="text-text-tertiary mb-4" />
                <h3 className="font-sans text-base text-text-primary font-medium mb-2">
                  {feature.title}
                </h3>
                <p className="font-sans text-sm text-text-tertiary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── TECH STACK ───── */}
      <section className="px-4 py-24 border-t border-border-default">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-[10px] text-text-tertiary tracking-[0.25em] uppercase mb-8">
            POWERED BY
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {[
              'turbopuffer',
              'ElevenLabs',
              'Gemini 2.0',
              'Vercel',
              'Next.js',
              'Neon',
              'HuggingFace',
              'Freesound',
            ].map((name) => (
              <span
                key={name}
                className="font-mono text-sm text-text-secondary"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───── FINAL CTA ───── */}
      <section className="px-4 py-32 border-t border-border-default">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-text-primary mb-4">
            Start designing sound.
          </h2>
          <p className="font-sans text-lg text-text-tertiary mb-10">
            No account required. 100% royalty-free output.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/sfx"
              className="group flex items-center justify-center gap-2 bg-sd-accent text-bg-base font-sans text-base font-medium px-8 py-4 rounded-lg transition-all hover:bg-sd-accent-dim"
            >
              <Zap size={18} />
              Sound Effects
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/scene"
              className="group flex items-center justify-center gap-2 border border-border-default text-text-primary font-sans text-base font-medium px-8 py-4 rounded-lg transition-all hover:border-sd-accent"
            >
              <Layers size={18} />
              Scene Design
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="px-4 py-8 border-t border-border-default">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-xs text-text-tertiary">
            SoundDrop — AI sound design tool
          </span>
          <div className="flex gap-6">
            <Link href="/sfx" className="font-mono text-xs text-text-tertiary hover:text-text-primary transition-colors">
              SFX
            </Link>
            <Link href="/scene" className="font-mono text-xs text-text-tertiary hover:text-text-primary transition-colors">
              Scene
            </Link>
            <Link href="/gallery" className="font-mono text-xs text-text-tertiary hover:text-text-primary transition-colors">
              Gallery
            </Link>
          </div>
        </div>
      </footer>

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSignIn={() => {}}
      />
    </div>
  )
}
