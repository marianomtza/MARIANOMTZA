'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useSound } from '../contexts/SoundContext'

type ToneLike = {
  start: () => Promise<void>
  PolySynth: new (...args: unknown[]) => ToneInstrumentLike
  Synth: unknown
  Gain: new (value?: number) => { toDestination: () => { connect: (node: unknown) => void } }
  context: { state: string }
}

interface ToneInstrumentLike {
  connect: (node: unknown) => ToneInstrumentLike
  triggerAttackRelease: (note: string | string[], duration: string, time?: number, velocity?: number) => void
  dispose: () => void
  volume: { value: number }
}

const NOTE_POOL = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6'] as const
const GLOBAL_DEBOUNCE_MS = 70
const PER_NOTE_DEBOUNCE_MS = 220

const shared = {
  tone: null as ToneLike | null,
  synth: null as ToneInstrumentLike | null,
  loading: false,
}

async function ensurePianoLoaded() {
  if (shared.synth || shared.loading) return
  shared.loading = true
  try {
    const ToneModule = (await import('tone/build/Tone')) as unknown as ToneLike
    shared.tone = ToneModule

    const gain = new ToneModule.Gain(0.42)
    gain.toDestination()

    const PolySynth = ToneModule.PolySynth as unknown as new (opts: unknown) => ToneInstrumentLike
    const synth = new PolySynth({
      maxPolyphony: 6,
      voice: ToneModule.Synth,
      options: {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.004, decay: 0.2, sustain: 0, release: 0.35 },
      },
    })
    synth.volume.value = -13
    synth.connect(gain as unknown)
    shared.synth = synth
  } finally {
    shared.loading = false
  }
}

export function usePianoDock() {
  const { enabled } = useSound()
  const enabledRef = useRef(enabled)
  const unlockedRef = useRef(false)
  const lastGlobalPlayRef = useRef(0)
  const lastNotePlayRef = useRef<Record<number, number>>({})

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const primeOnInteraction = useCallback(async () => {
    if (!enabledRef.current) return
    await ensurePianoLoaded()
    if (!shared.tone || unlockedRef.current) return
    try {
      if (shared.tone.context.state !== 'running') {
        await shared.tone.start()
      }
      unlockedRef.current = true
    } catch {
      // graceful no-audio fallback
    }
  }, [])

  useEffect(() => {
    const unlock = () => {
      void primeOnInteraction()
    }
    window.addEventListener('pointerdown', unlock, { passive: true, once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [primeOnInteraction])

  const playNote = useCallback(
    async (index: number, velocity = 0.56) => {
      if (!enabledRef.current) return
      const now = performance.now()
      if (now - lastGlobalPlayRef.current < GLOBAL_DEBOUNCE_MS) return
      const lastForThis = lastNotePlayRef.current[index] ?? 0
      if (now - lastForThis < PER_NOTE_DEBOUNCE_MS) return
      lastGlobalPlayRef.current = now
      lastNotePlayRef.current[index] = now

      await primeOnInteraction()

      if (!shared.synth || !shared.tone || shared.tone.context.state !== 'running') return
      const note = NOTE_POOL[index % NOTE_POOL.length]
      try {
        shared.synth.triggerAttackRelease(note, '16n', undefined, velocity)
      } catch {
        // noop
      }
    },
    [primeOnInteraction]
  )

  return { playNote, primeOnInteraction }
}
