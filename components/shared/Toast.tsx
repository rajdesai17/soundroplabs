'use client'

import { useEffect } from 'react'

export type ToastType = 'success' | 'error'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const borderColor = type === 'success' ? 'border-l-success' : 'border-l-danger'

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
      <div className={`bg-bg-surface border border-border-default border-l-2 ${borderColor} rounded-md px-4 py-3`}>
        <p className="font-sans text-sm text-text-primary">{message}</p>
      </div>
    </div>
  )
}

// Hook for managing toasts
import { useState, useCallback } from 'react'

interface ToastState {
  message: string
  type: ToastType
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }, [])

  const hideToast = useCallback(() => {
    setToast(null)
  }, [])

  return { toast, showToast, hideToast }
}
