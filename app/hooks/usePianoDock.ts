'use client'

import { useRef, useCallback, useEffect, useState } from 'react'

type ToneModule = typeof import('tone/build/Tone')

type PianoVoice = {
  triggerAttackRelease: (note: string, duration: string, time?: number, velocity?: number) => void
  triggerRelease: () => void
  dispose: () => void
}

const NOTES = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6']
const SOUND_STORAGE_KEY = 'marianomtza:sound-enabled'
const DEBOUNCE_MS = 80

export function usePianoDock() {
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

  const stopAll = useCallback(() => {
    voicesRef.current.forEach((voice) => voice.triggerRelease())
  }, [])

  const initAudio = useCallback(async () => {
    if (isReadyRef.current) return true

    try {
      const Tone = (await import('tone/build/Tone')) as ToneModule
      await Tone.start()

      voicesRef.current = Array.from({ length: 5 }).map(() => {
        const synth = new Tone.Synth({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.004, decay: 0.1, sustain: 0.04, release: 0.2 },
        }).toDestination()

        return synth as unknown as PianoVoice
      })

      isReadyRef.current = true
      return true
    } catch {
      return false
    }
  }, [])

  const playNote = useCallback(async (index: number, velocity = 0.5) => {
    if (!enabled) return

    const now = performance.now()
    if (now - lastPlayRef.current < DEBOUNCE_MS) return
    lastPlayRef.current = now

    const ready = await initAudio()
    if (!ready || voicesRef.current.length === 0) return

    const voice = voicesRef.current[nextVoiceRef.current]
    nextVoiceRef.current = (nextVoiceRef.current + 1) % voicesRef.current.length
    voice.triggerAttackRelease(NOTES[index % NOTES.length], '16n', undefined, velocity)
  }, [enabled, initAudio])

  const toggleSound = useCallback(async () => {
    const next = !enabled
    setEnabled(next)

    if (next) {
      await initAudio()
      return
    }

    stopAll()
  }, [enabled, initAudio, stopAll])

  useEffect(() => {
    const handleBlur = () => {
      lastPlayRef.current = 0
      stopAll()
    }

    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleBlur)

    return () => {
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleBlur)
      stopAll()
      voicesRef.current.forEach((voice) => voice.dispose())
      voicesRef.current = []
      isReadyRef.current = false
    }
  }, [stopAll])

  return { playNote, enabled, toggleSound }
}
