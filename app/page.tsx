'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { ArrowRight, Zap, Layers, Search, Sparkles, AudioWaveform } from 'lucide-react'
import Navigation from '@/components/shared/Navigation'
import SignInModal from '@/components/shared/SignInModal'

export default function LandingPage() {
  const { data: session } = useSession()
  const [showSignIn, setShowSignIn] = useState(false)

  return (
    <div
      className="min-h-screen bg-bg-base relative"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
      }}
    >
      <Navigation
        user={session?.user ? {
          name: session.user.name ?? 'User',
          initials: (session.user.name ?? 'U').slice(0, 2).toUpperCase(),
        } : null}
        onSignInClick={() => setShowSignIn(true)}
      />

      {/* ─── HERO ─── */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        {/* Background: grid + glows */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Primary accent glow */}
          <div
            className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px]"
            style={{ background: 'radial-gradient(ellipse at center, rgba(232,240,85,0.07) 0%, rgba(232,240,85,0.02) 35%, transparent 65%)' }}
          />

          {/* Blue glow — top right */}
          <div
            className="absolute -top-[10%] right-[5%] w-[500px] h-[500px]"
            style={{ background: 'radial-gradient(circle, rgba(74,158,255,0.05) 0%, transparent 60%)' }}
          />

          {/* Purple glow — bottom left */}
          <div
            className="absolute bottom-[5%] -left-[5%] w-[450px] h-[450px]"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 60%)' }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-3 mb-8 animate-fade-in-up">
          <div className="flex items-center gap-4 opacity-50">
            <img src="/lockup_dark.svg" alt="turbopuffer" className="h-5" />
            <span className="font-mono text-xs text-text-tertiary">+</span>
            <img src="/elevenlabs-logo.svg" alt="ElevenLabs" className="h-3 invert" />
          </div>
          <span className="font-mono text-[11px] text-sd-accent tracking-wide">#ElevenHacks</span>
        </div>

        <h1
          className="relative z-10 font-serif text-5xl sm:text-6xl md:text-8xl text-text-primary text-center leading-[0.92] mb-4 animate-fade-in-up"
          style={{ animationDelay: '80ms' }}
        >
          Generate the sound<br className="hidden sm:block" /> you hear in your head.
        </h1>

        <p
          className="relative z-10 font-sans text-lg md:text-xl text-text-secondary text-center max-w-lg mb-10 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: '160ms' }}
        >
          AI sound design powered by semantic search over 26,000 real sounds.
          Single effects or full scene soundscapes — in seconds.
        </p>

        {/* Hero CTAs */}
        <div
          className="relative z-10 flex flex-col sm:flex-row gap-3 animate-fade-in-up"
          style={{ animationDelay: '240ms' }}
        >
          <Link
            href="/sfx"
            className="group flex items-center gap-3 bg-sd-accent text-bg-base font-sans px-7 py-3.5 rounded-lg transition-all hover:bg-sd-accent-dim"
          >
            <Zap size={15} />
            <span className="text-sm font-medium">Generate SFX</span>
            <span className="text-[11px] opacity-60">4 variations + music bed</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/scene"
            className="group flex items-center gap-3 border border-border-default text-text-primary font-sans px-7 py-3.5 rounded-lg transition-all hover:border-border-hover hover:bg-bg-surface"
          >
            <Layers size={15} />
            <span className="text-sm font-medium">Design a Scene</span>
            <span className="text-[11px] text-text-tertiary">4 layers + DAW mixer</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* ─── PIPELINE ─── */}
      <section className="px-4 py-20 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-[10px] text-text-tertiary tracking-[0.25em] uppercase mb-3 text-center">
            THE PIPELINE
          </p>
          <h2 className="font-serif text-2xl md:text-3xl text-text-primary text-center mb-14">
            From words to waveforms in 4 steps
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border-default rounded-xl overflow-hidden">
            {[
              { num: '01', title: 'Embed', desc: 'Your query becomes a 384-dim vector', accent: '#E8F055' },
              { num: '02', title: 'Search', desc: '8 neighbors found in ~20ms via turbopuffer', accent: '#4A9EFF' },
              { num: '03', title: 'Enrich', desc: 'Gemini adds acoustic detail to the prompt', accent: '#8B5CF6' },
              { num: '04', title: 'Generate', desc: 'ElevenLabs renders the final audio', accent: '#F59E0B' },
            ].map((step) => (
              <div key={step.num} className="bg-bg-base p-5 md:p-6">
                <span className="font-mono text-[10px] tracking-wider block mb-3" style={{ color: step.accent }}>
                  {step.num}
                </span>
                <h3 className="font-sans text-sm text-text-primary font-medium mb-1">
                  {step.title}
                </h3>
                <p className="font-sans text-xs text-text-tertiary leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TWO MODES ─── */}
      <section className="px-4 py-20 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-[10px] text-text-tertiary tracking-[0.25em] uppercase mb-3 text-center">
            TWO MODES
          </p>
          <h2 className="font-serif text-2xl md:text-3xl text-text-primary text-center mb-14">
            One sound or a full soundscape
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/sfx"
              className="group border border-border-default rounded-xl p-7 transition-all hover:border-sd-accent hover:bg-sd-accent/[0.03]"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-sd-accent/10 flex items-center justify-center">
                  <Zap size={15} className="text-sd-accent" />
                </div>
                <span className="font-mono text-[10px] text-sd-accent tracking-wider uppercase">
                  Sound Effects
                </span>
              </div>
              <h3 className="font-sans text-xl text-text-primary font-medium mb-2">
                Describe any sound.
                <span className="text-text-secondary italic"> Hear it instantly.</span>
              </h3>
              <p className="font-sans text-sm text-text-tertiary leading-relaxed mb-5">
                4 unique SFX variations from a single description.
                Add a music bed to complement the effect.
                Each variation grounded in real acoustic neighbors.
              </p>
              <span className="font-mono text-xs text-text-tertiary group-hover:text-sd-accent transition-colors inline-flex items-center gap-1.5">
                Start generating <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/scene"
              className="group border border-border-default rounded-xl p-7 transition-all hover:border-[#4A9EFF] hover:bg-[#4A9EFF]/[0.03]"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[#4A9EFF]/10 flex items-center justify-center">
                  <Layers size={15} className="text-[#4A9EFF]" />
                </div>
                <span className="font-mono text-[10px] text-[#4A9EFF] tracking-wider uppercase">
                  Scene Design
                </span>
              </div>
              <h3 className="font-sans text-xl text-text-primary font-medium mb-2">
                Describe a scene.
                <span className="text-text-secondary italic"> Hear every layer.</span>
              </h3>
              <p className="font-sans text-sm text-text-tertiary leading-relaxed mb-5">
                AI decomposes your scene into ambience, foreground, background, and music.
                4 parallel pipelines. DAW-style mixer. ZIP export.
              </p>
              <span className="font-mono text-xs text-text-tertiary group-hover:text-[#4A9EFF] transition-colors inline-flex items-center gap-1.5">
                Compose a scene <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="px-4 py-20 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border-default rounded-xl overflow-hidden">
            {[
              {
                icon: Search,
                title: 'Semantic RAG',
                desc: '26,000 Freesound samples indexed in turbopuffer. Every generation is grounded in real acoustic data.',
              },
              {
                icon: Sparkles,
                title: 'Dual AI Generation',
                desc: 'ElevenLabs Sound Effects API for SFX. Music API for instrumental beds. Both in one workflow.',
              },
              {
                icon: AudioWaveform,
                title: 'Real-time Streaming',
                desc: 'Server-sent events stream each pipeline stage live. Watch neighbors appear, prompts build, audio materialize.',
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-bg-base p-6">
                <feature.icon size={18} className="text-text-tertiary mb-3" />
                <h3 className="font-sans text-sm text-text-primary font-medium mb-1.5">
                  {feature.title}
                </h3>
                <p className="font-sans text-xs text-text-tertiary leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="px-4 py-24 border-t border-white/[0.04]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-text-primary mb-3">
            Start designing sound.
          </h2>
          <p className="font-sans text-sm text-text-tertiary mb-8">
            No account required. Royalty-free output.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/sfx"
              className="group flex items-center justify-center gap-2 bg-sd-accent text-bg-base font-sans text-sm font-medium px-7 py-3.5 rounded-lg transition-all hover:bg-sd-accent-dim"
            >
              Generate SFX <ArrowRight size={15} />
            </Link>
            <Link
              href="/scene"
              className="group flex items-center justify-center gap-2 border border-border-default text-text-primary font-sans text-sm font-medium px-7 py-3.5 rounded-lg transition-all hover:border-border-hover hover:bg-bg-surface"
            >
              Design a Scene <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── POWERED BY ─── */}
      <section className="px-4 py-16 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-[10px] text-text-ghost tracking-[0.25em] uppercase text-center mb-8">
            POWERED BY
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14 opacity-60 hover:opacity-80 transition-opacity">
            {/* turbopuffer */}
            <img
              src="/lockup_dark.svg"
              alt="turbopuffer"
              className="h-7 md:h-8"
            />
            {/* ElevenLabs */}
            <img
              src="/elevenlabs-logo.svg"
              alt="ElevenLabs"
              className="h-4 md:h-5 invert"
            />
            {/* Text logos for others */}
            {['Gemini', 'Vercel', 'HuggingFace', 'Freesound'].map(name => (
              <span key={name} className="font-mono text-sm text-text-secondary">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="px-4 py-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-mono text-[10px] text-text-ghost">
            SoundDrop &middot; AI sound design
          </span>
          <div className="flex gap-5">
            {[
              { href: '/sfx', label: 'SFX' },
              { href: '/scene', label: 'Scene' },
              { href: '/gallery', label: 'Gallery' },
              { href: '/library', label: 'Library' },
            ].map(link => (
              <Link key={link.href} href={link.href} className="font-mono text-[10px] text-text-ghost hover:text-text-tertiary transition-colors">
                {link.label}
              </Link>
            ))}
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
