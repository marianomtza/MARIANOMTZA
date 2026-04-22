import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useAudio } from '../contexts/AudioContext'
import { useTheme } from '../contexts/ThemeContext'
import { useEventListener, useInterval } from '../hooks/useAnimations'
import { useMotion, useMotionFrame } from '../contexts/MotionContext'
import { PIANO_SCALE } from '../constants'

/**
 * Hero Component - Main title with piano magnifier effect
 * Features: Mac Dock-style magnification, piano audio, glow effects
 */
export function Hero() {
  const audio = useAudio()
  const theme = useTheme()
  const [revealed, setRevealed] = useState(false)
  const [roleIdx, setRoleIdx] = useState(0)
  const titleRef = useRef(null)
  const charRefs = useRef([])
  const metricsRef = useRef([])
  const lastCharRef = useRef(-1)
  const proximityRef = useRef([])
  const { pointerRef } = useMotion()

  const TITLE = 'SYSTEM'
  const ROLES = [
    'Curated Roster',
    'Booking Platform',
    'Network of Talent',
    'Control & Direction',
  ]

  useEffect(() => {
    setRevealed(true)
  }, [])

  useInterval(() => setRoleIdx((i) => (i + 1) % ROLES.length), 2600)

  const updateCharMetrics = useCallback(() => {
    metricsRef.current = charRefs.current.map((charEl) => {
      if (!charEl) return null
      const rect = charEl.getBoundingClientRect()
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      }
    })
  }, [])

  useEffect(() => {
    updateCharMetrics()
  }, [updateCharMetrics])

  useEventListener('resize', updateCharMetrics, window)
  useEventListener('scroll', updateCharMetrics, window)

  const getMagnifiedCharIndex = useCallback((clientX, clientY) => {
    const metrics = metricsRef.current
    for (let i = 0; i < metrics.length; i++) {
      const rect = metrics[i]
      if (!rect) continue
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        return i
      }
    }
    return -1
  }, [])

  const applyMagnification = useCallback((idx) => {
    if (!charRefs.current.length) return
    const chars = charRefs.current
    chars.forEach((el, i) => {
      if (!el) return
      const dist = Math.abs(i - idx)
      if (dist === 0) {
        el.style.transform = 'translateY(-18px) scale(1.85)'
        el.style.color = theme.currentTheme.accent
        el.style.textShadow = `0 0 20px ${theme.currentTheme.accent}, 0 0 40px rgba(168, 85, 247, 0.4)`
        el.style.zIndex = '10'
      } else if (dist === 1) {
        el.style.transform = 'translateY(-10px) scale(1.45)'
        el.style.textShadow = `0 0 12px rgba(168, 85, 247, 0.3)`
        el.style.color = ''
        el.style.zIndex = '5'
      } else if (dist === 2) {
        el.style.transform = 'translateY(-4px) scale(1.18)'
        el.style.textShadow = `0 0 6px rgba(168, 85, 247, 0.15)`
        el.style.color = ''
        el.style.zIndex = '2'
      } else if (dist === 3) {
        el.style.transform = 'translateY(-1px) scale(1.06)'
        el.style.textShadow = ''
        el.style.color = ''
        el.style.zIndex = ''
      } else {
        el.style.transform = 'translateY(0) scale(1)'
        el.style.textShadow = ''
        el.style.color = ''
        el.style.zIndex = ''
      }
    })
  }, [theme.currentTheme.accent])

  const resetMagnification = useCallback(() => {
    if (!charRefs.current.length) return
    const chars = charRefs.current
    chars.forEach((el) => {
      if (!el) return
      el.style.transform = ''
      el.style.color = ''
      el.style.zIndex = ''
      el.style.textShadow = ''
    })
  }, [])

  const playPianoNote = useCallback((index) => {
    audio.ensureContext()
    const freq = PIANO_SCALE[index % PIANO_SCALE.length]
    if (audio.note) audio.note(freq, 0.16)
  }, [audio])

  useMotionFrame(() => {
    if (!charRefs.current.length) return
    const pointer = pointerRef.current
    const hitIndex = getMagnifiedCharIndex(pointer.x, pointer.y)
    if (hitIndex !== lastCharRef.current) {
      lastCharRef.current = hitIndex
      if (hitIndex >= 0) {
        playPianoNote(hitIndex)
      }
    }

    const metrics = metricsRef.current
    const maxRadius = 280
    charRefs.current.forEach((el, index) => {
      if (!el || !metrics[index]) return
      const rect = metrics[index]
      const cx = (rect.left + rect.right) / 2
      const cy = (rect.top + rect.bottom) / 2
      const dx = pointer.x - cx
      const dy = pointer.y - cy
      const distance = Math.sqrt(dx * dx + dy * dy)
      const target = Math.max(0, 1 - distance / maxRadius)
      const prev = proximityRef.current[index] || 0
      const next = prev + (target - prev) * 0.16
      proximityRef.current[index] = next

      const lift = -20 * next
      const scale = 1 + 0.9 * next
      el.style.transform = `translateY(${lift}px) scale(${scale})`
      el.style.color = next > 0.08 ? theme.currentTheme.accent : ''
      el.style.textShadow = next > 0.08 ? `0 0 ${20 * next}px ${theme.currentTheme.accent}` : ''
      el.style.zIndex = next > 0.1 ? '10' : ''
    })
  })

  const handleLetterMove = useCallback((e) => {
    const i = getMagnifiedCharIndex(e.clientX, e.clientY)
    if (i !== lastCharRef.current) {
      lastCharRef.current = i
      if (i >= 0) {
        applyMagnification(i)
        playPianoNote(i)
      } else {
        resetMagnification()
      }
    }
  }, [applyMagnification, getMagnifiedCharIndex, playPianoNote, resetMagnification])

  const handleLetterLeave = useCallback(() => {
    lastCharRef.current = -1
    resetMagnification()
  }, [resetMagnification])

  return (
    <section className="hero" id="top">
      <div>
        <div className="hero-eyebrow">→ Ciudad de México</div>
        <h1
          className={`hero-title ${revealed ? 'revealed' : ''}`}
          aria-label={TITLE}
          ref={titleRef}
          style={{ overflow: 'visible' }}
          onMouseEnter={updateCharMetrics}
        >
          <span className="word" style={{ overflow: 'visible' }}>
            {TITLE.split('').map((ch, i) => (
              <span
                key={i}
                ref={(el) => (charRefs.current[i] = el)}
                className="char piano-char"
                style={{
                  transitionDelay: `${i * 50 + 400}ms`,
                  transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.18s, text-shadow 0.18s',
                  display: 'inline-block',
                  position: 'relative',
                  transformOrigin: 'bottom center',
                  willChange: 'transform, color, text-shadow',
                  cursor: 'pointer',
                }}
                onMouseMove={handleLetterMove}
                onMouseLeave={handleLetterLeave}
                data-note={i}
              >
                {ch}
              </span>
            ))}
          </span>
        </h1>
      </div>

      <div className="hero-bottom">
        <div>
          <div className="hero-role">{ROLES[roleIdx]}</div>
          <div className="hero-desc">
            Plataforma de booking y roster curado. Conectando talento en <strong>Ciudad de México</strong>.
          </div>
          <div className="hero-ctas">
            <a href="#booking" className="btn primary">
              Booking
              <span className="arr">→</span>
            </a>
          </div>
        </div>
        <div className="hero-scroll">Scroll para explorar</div>
      </div>
    </section>
  )
}
