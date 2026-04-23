import { useRef, useEffect, useCallback } from 'react'
import * as Tone from 'tone'

const NOTE_FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46]

export function usePianoDock() {
  const synthRef = useRef<Tone.Synth | null>(null)
  const lastPlayRef = useRef(0)
  const DEBOUNCE = 70

  useEffect(() => {
    synthRef.current = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.008, decay: 0.18, sustain: 0.12, release: 0.35 }
    }).toDestination()

    return () => {
      synthRef.current?.dispose()
      synthRef.current = null
    }
  }, [])

  const playNote = useCallback(async (index: number, velocity = 0.65) => {
    const now = Date.now()
    if (now - lastPlayRef.current < DEBOUNCE) return
    lastPlayRef.current = now

    if (!synthRef.current) return

    try {
      await Tone.start()
      const freq = NOTE_FREQUENCIES[index % NOTE_FREQUENCIES.length]
      synthRef.current.triggerAttackRelease(freq, '8n', undefined, velocity)
    } catch (e) {
      console.warn('Audio no disponible')
    }
  }, [])

  return { playNote }
}
