import React, { createContext, useContext, useRef, useState, useCallback } from 'react'

const AudioContext = createContext(null)

/**
 * AudioProvider - Initialize and manage Web Audio API
 * Features: Lazy initialization, auto-resume on user interaction
 */
export function AudioProvider({ children }) {
  const ctxRef = useRef(null)
  const [enabled, setEnabled] = useState(false)
  const enabledRef = useRef(false)

  const init = useCallback(() => {
    if (ctxRef.current) return ctxRef.current
    const AC = window.AudioContext || window.webkitAudioContext
    const ctx = new AC()
    ctxRef.current = ctx
    return ctx
  }, [])

  const ensureContext = useCallback(() => {
    init()
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume()
    }
  }, [init])

  const toggle = useCallback(() => {
    const next = !enabledRef.current
    enabledRef.current = next
    setEnabled(next)
    if (next) {
      init()
      if (ctxRef.current?.state === 'suspended') {
        ctxRef.current.resume()
      }
    }
  }, [init])

  // Audio effects
  const blip = useCallback((freq = 880, dur = 0.08, type = 'sine', vol = 0.08) => {
    const ctx = ctxRef.current
    if (!ctx || !enabledRef.current) return

    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    g.gain.value = 0
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    osc.connect(g)
    g.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + dur + 0.02)
  }, [])

  const note = useCallback((freq, vol = 0.18) => {
    const ctx = ctxRef.current
    if (!ctx || !enabledRef.current) return
    const now = ctx.currentTime

    const master = ctx.createGain()
    master.gain.value = 0
    master.gain.linearRampToValueAtTime(vol, now + 0.008)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
    master.connect(ctx.destination)

    const partials = [
      { f: freq, t: 'sine', g: 1.0 },
      { f: freq * 2, t: 'sine', g: 0.35 },
      { f: freq * 3, t: 'triangle', g: 0.12 },
      { f: freq * 1.002, t: 'sine', g: 0.22 },
    ]

    partials.forEach((p) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = p.t
      o.frequency.value = p.f
      g.gain.value = p.g
      o.connect(g)
      g.connect(master)
      o.start(now)
      o.stop(now + 1.3)
    })

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 4200
    lp.Q.value = 0.7
    master.disconnect()
    master.connect(lp)
    lp.connect(ctx.destination)
  }, [])

  const whoosh = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx || !enabledRef.current) return

    const noise = ctx.createBufferSource()
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    }
    noise.buffer = buf

    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 1200
    f.Q.value = 3

    const g = ctx.createGain()
    g.gain.value = 0.12
    noise.connect(f)
    f.connect(g)
    g.connect(ctx.destination)
    noise.start()
    noise.stop(ctx.currentTime + 0.3)
  }, [])

  const value = {
    enabled,
    toggle,
    ensureContext,
    hover: () => blip(1200 + Math.random() * 400, 0.05, 'sine', 0.04),
    click: () => blip(440, 0.12, 'triangle', 0.1),
    note,
    whoosh,
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

/**
 * useAudio - Hook to access audio system
 */
export function useAudio() {
  const ctx = useContext(AudioContext)
  if (!ctx) {
    throw new Error('useAudio must be used within AudioProvider')
  }
  return ctx
}
