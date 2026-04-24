'use client'

import { useCallback, useRef } from 'react'

type ToneModule = typeof import('tone/build/Tone')

type Voice = {
  triggerAttackRelease: (note: string, duration: string, time?: number, velocity?: number) => void
  releaseAll?: () => void
  dispose: () => void
}

const NOTE_POOL = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6']
const DEBOUNCE_MS = 80

export function usePianoDock() {
  const toneRef = useRef<ToneModule | null>(null)
  const voicesRef = useRef<Voice[]>([])
  const initializedRef = useRef(false)
  const initPromiseRef = useRef<Promise<void> | null>(null)
  const lastPlayRef = useRef(0)

  const initialize = useCallback(async () => {
    if (initializedRef.current) return
    if (initPromiseRef.current) return initPromiseRef.current

    initPromiseRef.current = import('tone/build/Tone')
      .then(async (toneModule) => {
        toneRef.current = toneModule
        await toneModule.start()

        const voices = new Array(4).fill(null).map((_, idx) => {
          const synth = new toneModule.PolySynth(toneModule.Synth, {
            oscillator: { type: idx % 2 === 0 ? 'triangle' : 'sine' },
            envelope: { attack: 0.005, decay: 0.12, sustain: 0.05, release: 0.16 },
          }).toDestination()

          synth.volume.value = -10
          return synth as unknown as Voice
        })

        voicesRef.current = voices
        initializedRef.current = true
      })
      .catch(() => {
        toneRef.current = null
      })

    return initPromiseRef.current
  }, [])

  const playNote = useCallback(
    async (index: number, velocity = 0.62, enabled = true) => {
      if (!enabled) return

      const now = performance.now()
      if (now - lastPlayRef.current < DEBOUNCE_MS) return
      lastPlayRef.current = now

      await initialize()
      if (!initializedRef.current || voicesRef.current.length === 0) return

      const note = NOTE_POOL[index % NOTE_POOL.length]
      const voice = voicesRef.current[index % voicesRef.current.length]
      voice.triggerAttackRelease(note, '16n', undefined, velocity)
    },
    [initialize]
  )

  return { playNote }
}
