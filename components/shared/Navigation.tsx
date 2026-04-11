'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

interface NavigationProps {
  user?: { name: string; initials: string } | null
  onSignInClick?: () => void
}

function AnimatedWaveform() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="mr-2">
      <rect x="1" y="6" width="2" height="4" fill="#F0F0F0" className="waveform-bar" />
      <rect x="5" y="4" width="2" height="8" fill="#F0F0F0" className="waveform-bar" />
      <rect x="9" y="5" width="2" height="6" fill="#F0F0F0" className="waveform-bar" />
      <rect x="13" y="6" width="2" height="4" fill="#F0F0F0" className="waveform-bar" />
    </svg>
  )
}

export default function Navigation({ user, onSignInClick }: NavigationProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/scene', label: 'Scene' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/library', label: 'Library' },
  ]

  return (
    <nav className="h-14 border-b border-bg-surface flex items-center justify-between px-4 md:px-6 bg-bg-base">
      <Link href="/" className="flex items-center font-mono text-base font-medium text-text-primary">
        <AnimatedWaveform />
        SoundDrop
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-6">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`font-sans text-sm transition-colors duration-150 ${
              pathname === link.href ? 'text-text-primary' : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            {link.label}
          </Link>
        ))}
        
        {user ? (
          <div className="w-8 h-8 rounded bg-bg-elevated flex items-center justify-center">
            <span className="font-mono text-xs text-text-primary">{user.initials}</span>
          </div>
        ) : (
          <button
            onClick={onSignInClick}
            className="font-sans text-sm text-text-tertiary hover:text-text-primary transition-colors duration-150"
          >
            Sign in
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 text-text-secondary hover:text-text-primary"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-70 bg-bg-surface z-50 md:hidden">
            <div className="p-4 border-b border-bg-elevated flex justify-end">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-text-secondary hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`h-12 px-6 flex items-center font-sans text-base border-b border-bg-elevated ${
                  pathname === '/' ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                Home
              </Link>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`h-12 px-6 flex items-center font-sans text-base border-b border-bg-elevated ${
                    pathname === link.href ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <div className="h-12 px-6 flex items-center gap-3 border-b border-bg-elevated">
                  <div className="w-8 h-8 rounded bg-bg-elevated flex items-center justify-center">
                    <span className="font-mono text-xs text-text-primary">{user.initials}</span>
                  </div>
                  <span className="font-sans text-base text-text-primary">{user.name}</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onSignInClick?.()
                  }}
                  className="h-12 px-6 flex items-center font-sans text-base text-text-secondary border-b border-bg-elevated text-left"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
