'use client'

import { useCallback } from 'react'

export function usePianoDock() {
  const playNote = useCallback((index: number, velocity?: number) => {
    // Placeholder - Tone.js will be integrated later
  }, [])

  return { playNote }
}
