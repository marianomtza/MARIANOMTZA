import React, { useState, useRef, useEffect } from 'react'
import { useAudio } from '../contexts/AudioContext'
import { useTheme } from '../contexts/ThemeContext'
import { useEventListener, useInterval } from '../hooks/useAnimations'
import { PIANO_SCALE } from '../constants'

/**
 * Hero Component - Main title with piano magnifier effect
 * Features: Mac Dock-style magnification, piano audio, glow effects
 */
export function Hero() {
  const audio = useAudio()
  const theme = useTheme()
  const [rev, setRev] = useState(false)
  const [roleIdx, setRoleIdx] = useState(0)
  const titleRef = useRef(null)
  const charRefs = useRef([])
  const lastCharRef = useRef(-1)

  const TITLE = 'MARIANOMTZA'
  const ROLES = [
    'Productor de Eventos',
    'Muevo Gente',
    'Manager',
    'Conecto Puntos',
    'A&R',
    'Documento Todo',
    'Director Creativo',
  ]

  // Initial reveal animation
  useEffect(() => {
    const timer = setTimeout(() => setRev(true), 200)
    return () => clearTimeout(timer)
  }, [])

  // Cycle through roles
  useInterval(() => setRoleIdx((i) => (i + 1) % ROLES.length), 2600)

  // Get precise character under cursor
  const getMagnifiedCharIndex = (e) => {
    if (!charRefs.current.length) return -1
    const chars = charRefs.current
    const cursorX = e.clientX
    const cursorY = e.clientY
    for (let i = 0; i < chars.length; i++) {
      if (!chars[i]) continue
      const rect = chars[i].getBoundingClientRect()
      if (cursorX >= rect.left && cursorX <= rect.right && cursorY >= rect.top && cursorY <= rect.bottom) {
        return i
      }
    }
    return -1
  }

  // Apply Mac Dock-style magnification
  const applyMagnification = (idx) => {
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
  }

  const resetMagnification = () => {
    if (!charRefs.current.length) return
    const chars = charRefs.current
    chars.forEach((el) => {
      if (!el) return
      el.style.transform = ''
      el.style.color = ''
      el.style.zIndex = ''
      el.style.textShadow = ''
    })
  }

  const playPianoNote = (index) => {
    audio.ensureContext()
    const freq = PIANO_SCALE[index % PIANO_SCALE.length]
    if (audio.note) audio.note(freq, 0.16)
  }

  const handleLetterMove = (e) => {
    const i = getMagnifiedCharIndex(e)
    if (i !== lastCharRef.current) {
      lastCharRef.current = i
      if (i >= 0) {
        applyMagnification(i)
        playPianoNote(i)
      } else {
        resetMagnification()
      }
    }
  }

  const handleLetterLeave = () => {
    lastCharRef.current = -1
    resetMagnification()
  }

  return (
    <section className="hero" id="top">
      <div>
        <div className="hero-eyebrow">→ Ciudad de México</div>
        <h1 className={`hero-title ${rev ? 'revealed' : ''}`} aria-label={TITLE} ref={titleRef} style={{ overflow: 'visible' }}>
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
            Dirijo noches que mueven gente. Booking y A&R en <strong>Ciudad de México</strong>.
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
