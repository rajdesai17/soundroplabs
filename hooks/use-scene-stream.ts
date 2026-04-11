'use client'

import { useRef, useCallback, useEffect } from 'react'
import type { SceneSSEEvent } from '@/lib/scene-types'

export function useSceneStream() {
  const abortRef = useRef<AbortController | null>(null)

  const startStream = useCallback(async (
    description: string,
    onEvent: (event: SceneSSEEvent) => void,
    onError: (msg: string) => void,
    onDone: () => void
  ) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        onError('Failed to start scene generation')
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6)) as SceneSSEEvent
              onEvent(event)
            } catch {
              // ignore parse errors
            }
          }
        }
      }
      onDone()
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        onError(err.message || 'Connection lost')
      }
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  return { startStream, cancel }
}
