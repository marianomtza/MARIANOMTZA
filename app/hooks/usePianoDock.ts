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

export function usePianoDock() {
  const { enabled } = useSound()
  const enabledRef = useRef(enabled)
  const toneRef = useRef<ToneLike | null>(null)
  const synthRef = useRef<ToneInstrumentLike | null>(null)
  const loadingRef = useRef(false)
  const lastGlobalPlayRef = useRef(0)
  const lastNotePlayRef = useRef<Record<number, number>>({})

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const ensureLoaded = useCallback(async () => {
    if (synthRef.current || loadingRef.current) return
    loadingRef.current = true

    const ToneModule = ((await import('tone/build/Tone').catch(() => null)) as ToneLike | null)
    if (!ToneModule) {
      loadingRef.current = false
      return
    }

    const gain = new ToneModule.Gain(0.45)
    gain.toDestination()
    const synth = new ToneModule.PolySynth({
      maxPolyphony: 7,
      voice: ToneModule.Synth,
      options: { oscillator: { type: 'triangle' }, envelope: { attack: 0.004, decay: 0.18, sustain: 0, release: 0.35 } },
    } as unknown)
    synth.volume.value = -12
    synth.connect(gain as unknown)

    toneRef.current = ToneModule
    synthRef.current = synth
    loadingRef.current = false
  }, [])

  useEffect(() => {
    const unlock = () => {
      void ensureLoaded().then(async () => {
        if (toneRef.current && toneRef.current.context.state !== 'running') {
          await toneRef.current.start().catch(() => undefined)
        }
      })
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
    window.addEventListener('pointerdown', unlock, { passive: true })
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      synthRef.current?.dispose()
    }
  }, [ensureLoaded])

  const playNote = useCallback(async (index: number, velocity = 0.55) => {
    if (!enabledRef.current) return
    const now = performance.now()
    if (now - lastGlobalPlayRef.current < GLOBAL_DEBOUNCE_MS) return
    const prev = lastNotePlayRef.current[index] ?? 0
    if (now - prev < PER_NOTE_DEBOUNCE_MS) return
    lastGlobalPlayRef.current = now
    lastNotePlayRef.current[index] = now

    await ensureLoaded()
    if (!synthRef.current || !toneRef.current) return
    if (toneRef.current.context.state !== 'running') await toneRef.current.start().catch(() => undefined)
    synthRef.current.triggerAttackRelease(NOTE_POOL[index % NOTE_POOL.length], '16n', undefined, velocity)
  }, [ensureLoaded])

  const primeOnInteraction = useCallback(async () => {
    if (!enabledRef.current) return
    await ensureLoaded()
    if (toneRef.current?.context.state !== 'running') await toneRef.current?.start().catch(() => undefined)
  }, [ensureLoaded])

  return { playNote, primeOnInteraction }
}
