'use client'

type AudioCue = 'hover' | 'success' | 'secret'

class AudioManager {
  private context: AudioContext | null = null
  private unlocked = false

  unlock = async () => {
    if (this.unlocked) return
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return

    this.context = this.context ?? new AudioCtx()
    if (this.context.state === 'suspended') {
      await this.context.resume()
    }
    this.unlocked = true
  }

  play = (cue: AudioCue) => {
    if (!this.context || !this.unlocked) return

    const now = this.context.currentTime
    const osc = this.context.createOscillator()
    const gain = this.context.createGain()

    const config: Record<AudioCue, { frequency: number; duration: number }> = {
      hover: { frequency: 280, duration: 0.05 },
      success: { frequency: 520, duration: 0.13 },
      secret: { frequency: 740, duration: 0.2 },
    }

    const { frequency, duration } = config[cue]

    osc.frequency.value = frequency
    osc.type = 'sine'

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc.connect(gain)
    gain.connect(this.context.destination)

    osc.start(now)
    osc.stop(now + duration)
  }
}

export const audioManager = new AudioManager()
