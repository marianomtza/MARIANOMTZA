'use client'

import { useRef, useCallback, useEffect, useState } from 'react'

type ToneModule = typeof import('tone/build/Tone')

type PianoVoice = {
  triggerAttackRelease: (note: string, duration: string, time?: number, velocity?: number) => void
  dispose: () => void
}

const NOTES = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6']
const SOUND_STORAGE_KEY = 'marianomtza:sound-enabled'
const DEBOUNCE_MS = 80

export function usePianoDock() {
  const toneRef = useRef<ToneModule | null>(null)
  const voicesRef = useRef<PianoVoice[]>([])
  const isReadyRef = useRef(false)
  const lastPlayRef = useRef(0)
  const nextVoiceRef = useRef(0)

  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const persisted = window.localStorage.getItem(SOUND_STORAGE_KEY)
    setEnabled(persisted === 'true')
  }, [])

  useEffect(() => {
    window.localStorage.setItem(SOUND_STORAGE_KEY, String(enabled))
  }, [enabled])

  const initAudio = useCallback(async () => {
    if (isReadyRef.current) return true

    try {
      const Tone = await import('tone/build/Tone')
      toneRef.current = Tone
      await Tone.start()

      voicesRef.current = Array.from({ length: 6 }).map(() => {
        const synth = new Tone.Synth({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.005, decay: 0.14, sustain: 0.06, release: 0.24 },
        }).toDestination()

        return synth as unknown as PianoVoice
      })

      isReadyRef.current = true
      return true
    } catch {
      return false
    }
  }, [])

  const playNote = useCallback(async (index: number, velocity = 0.55) => {
    if (!enabled) return

    const now = performance.now()
    if (now - lastPlayRef.current < DEBOUNCE_MS) return
    lastPlayRef.current = now

    const ready = await initAudio()
    if (!ready || voicesRef.current.length === 0) return

    const note = NOTES[index % NOTES.length]
    const voice = voicesRef.current[nextVoiceRef.current]
    nextVoiceRef.current = (nextVoiceRef.current + 1) % voicesRef.current.length

    voice.triggerAttackRelease(note, '16n', undefined, velocity)
  }, [enabled, initAudio])

  const toggleSound = useCallback(async () => {
    const next = !enabled
    setEnabled(next)

    if (next) {
      await initAudio()
    }
  }, [enabled, initAudio])

  useEffect(() => {
    return () => {
      voicesRef.current.forEach((voice) => voice.dispose())
      voicesRef.current = []
      toneRef.current = null
      isReadyRef.current = false
    }
  }, [])

  return { playNote, enabled, toggleSound }
}
