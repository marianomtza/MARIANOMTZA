'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useSound } from '../contexts/SoundContext'

type ToneLike = {
  start: () => Promise<void>
  PolySynth: new (...args: unknown[]) => ToneInstrumentLike
  Synth: unknown
  Gain: new (value?: number) => { toDestination: () => { connect: (node: unknown) => void } }
  now: () => number
  context: { state: string; resume: () => Promise<void> }
}

interface ToneInstrumentLike {
  connect: (node: unknown) => ToneInstrumentLike
  toDestination: () => ToneInstrumentLike
  triggerAttackRelease: (note: string | string[], duration: string, time?: number, velocity?: number) => void
  dispose: () => void
  volume: { value: number }
  set: (opts: Record<string, unknown>) => void
}

// Pentatonic C major across 2 octaves — pleasing, never dissonant
const NOTE_POOL = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6'] as const

const GLOBAL_DEBOUNCE_MS = 60
const PER_NOTE_DEBOUNCE_MS = 220

export function usePianoDock() {
  const { enabled } = useSound()
  const enabledRef = useRef(enabled)

  const toneRef = useRef<ToneLike | null>(null)
  const synthRef = useRef<ToneInstrumentLike | null>(null)
  const gainRef = useRef<{ toDestination: () => { connect: (node: unknown) => void } } | null>(null)
  const loadingRef = useRef(false)

  const lastGlobalPlayRef = useRef(0)
  const lastNotePlayRef = useRef<Record<number, number>>({})

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const ensureLoaded = useCallback(async () => {
    if (synthRef.current || loadingRef.current) return
    loadingRef.current = true
    try {
      const ToneModule = (await import('tone/build/Tone')) as unknown as ToneLike
      toneRef.current = ToneModule

      const gain = new ToneModule.Gain(0.5)
      gain.toDestination()

      const PolySynth = ToneModule.PolySynth as unknown as new (opts: unknown) => ToneInstrumentLike
      const synth = new PolySynth({
        maxPolyphony: 8,
        voice: ToneModule.Synth,
        options: {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.005, decay: 0.22, sustain: 0.0, release: 0.42 },
        },
      })
      synth.volume.value = -12
      synth.connect(gain as unknown)

      gainRef.current = gain
      synthRef.current = synth
    } catch (err) {
      console.warn('Piano init failed', err)
    } finally {
      loadingRef.current = false
    }
  }, [])

  useEffect(() => {
    return () => {
      try {
        synthRef.current?.dispose()
      } catch {
        /* noop */
      }
      synthRef.current = null
      gainRef.current = null
      toneRef.current = null
    }
  }, [])

  const playNote = useCallback(
    async (index: number, velocity = 0.55) => {
      if (!enabledRef.current) return

      const now = performance.now()
      if (now - lastGlobalPlayRef.current < GLOBAL_DEBOUNCE_MS) return
      const lastForThis = lastNotePlayRef.current[index] ?? 0
      if (now - lastForThis < PER_NOTE_DEBOUNCE_MS) return

      lastGlobalPlayRef.current = now
      lastNotePlayRef.current[index] = now

      if (!synthRef.current) {
        await ensureLoaded()
      }

      const synth = synthRef.current
      const Tone = toneRef.current
      if (!synth || !Tone) return

      try {
        if (Tone.context.state !== 'running') {
          await Tone.start()
        }
        const note = NOTE_POOL[index % NOTE_POOL.length]
        synth.triggerAttackRelease(note, '16n', undefined, velocity)
      } catch {
        /* swallow */
      }
    },
    [ensureLoaded]
  )

  const primeOnInteraction = useCallback(async () => {
    if (!enabledRef.current) return
    await ensureLoaded()
    try {
      if (toneRef.current && toneRef.current.context.state !== 'running') {
        await toneRef.current.start()
      }
    } catch {
      /* swallow */
    }
  }, [ensureLoaded])

  return { playNote, primeOnInteraction }
}
