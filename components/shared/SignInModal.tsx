'use client'

import { useEffect } from 'react'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSignIn: () => void
}

export default function SignInModal({ isOpen, onClose, onSignIn }: SignInModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-bg-surface border border-border-default rounded-xl p-8 max-w-90 w-full mx-4 animate-fade-in-up">
        <h2 className="font-serif text-2xl text-text-primary mb-2">
          Continue to save your sounds
        </h2>
        <p className="font-sans text-base text-text-tertiary mb-6">
          Your library is waiting.
        </p>
        
        <button
          onClick={onSignIn}
          className="w-full h-11 bg-text-primary text-bg-base font-sans text-sm font-medium rounded flex items-center justify-center gap-2 hover:bg-text-secondary transition-colors duration-150"
        >
          <GoogleIcon />
          Continue with Google
        </button>
        
        <button
          onClick={onClose}
          className="w-full mt-4 font-sans text-sm text-text-tertiary hover:text-text-secondary transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
