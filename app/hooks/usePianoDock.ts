'use client'

import { useRef, useEffect, useCallback } from 'react'

type ToneModule = {
  Synth: new (options?: unknown) => {
    toDestination: () => unknown
    triggerAttackRelease: (note: number, duration: string, time?: number, velocity?: number) => void
    dispose: () => void
  }
  start: () => Promise<void>
}

const NOTE_FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 698.46]

export function usePianoDock() {
  const toneRef = useRef<ToneModule | null>(null)
  const toneLoadRef = useRef<Promise<ToneModule | null> | null>(null)
  const synthRef = useRef<{
    triggerAttackRelease: (note: number, duration: string, time?: number, velocity?: number) => void
    dispose: () => void
  } | null>(null)
  const lastPlayRef = useRef(0)
  const DEBOUNCE_MS = 70

  useEffect(() => {
    return () => {
      synthRef.current?.dispose()
      synthRef.current = null
      toneRef.current = null
      toneLoadRef.current = null
    }
  }, [])

  const ensureTone = useCallback(async () => {
    if (toneRef.current && synthRef.current) return true

    if (!toneLoadRef.current) {
      toneLoadRef.current = import('tone/build/Tone')
        .then((toneModule) => {
          const Tone = toneModule as unknown as ToneModule
          toneRef.current = Tone
          const synth = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.008, decay: 0.18, sustain: 0.12, release: 0.35 },
          })
          synthRef.current = synth.toDestination() as {
            triggerAttackRelease: (note: number, duration: string, time?: number, velocity?: number) => void
            dispose: () => void
          }
          return Tone
        })
        .catch(() => {
          toneRef.current = null
          synthRef.current = null
          return null
        })
    }

    const loadedTone = await toneLoadRef.current
    return Boolean(loadedTone && synthRef.current)
  }, [])

  const playNote = useCallback(async (index: number, velocity = 0.65) => {
    const now = Date.now()
    if (now - lastPlayRef.current < DEBOUNCE_MS) return
    lastPlayRef.current = now

    const canPlay = await ensureTone()
    if (!canPlay || !synthRef.current || !toneRef.current) return

    try {
      await toneRef.current.start()
      const freq = NOTE_FREQUENCIES[index % NOTE_FREQUENCIES.length]
      synthRef.current.triggerAttackRelease(freq, '8n', undefined, velocity)
    } catch (_error) {
      // Ignorar errores de audio (autoplay policy o dispositivo sin salida)
    }
  }, [ensureTone])

  return { playNote }
}
