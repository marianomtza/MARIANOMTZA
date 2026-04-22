import React, { useState, useRef, useEffect } from 'react'
import { useAudio } from '../contexts/AudioContext'
import { useTheme } from '../contexts/ThemeContext'
import { useEventListener } from '../hooks/useAnimations'
import { useMotionFrame, useMotion } from '../contexts/MotionContext'
import { SITE_CONFIG } from '../constants'

/**
 * Nav Component - Fixed navigation with sound toggle
 */
export function Nav() {
  const audio = useAudio()
  const [revealed, setRevealed] = useState(false)
  const revealedRef = useRef(false)

  useEventListener(
    'scroll',
    () => {
      const nextRevealed = window.scrollY > 100
      if (nextRevealed !== revealedRef.current) {
        revealedRef.current = nextRevealed
        setRevealed(nextRevealed)
      }
    },
    window
  )

  return (
    <nav className={`nav ${revealed ? 'revealed' : ''}`}>
      <div className="nav-inner">
        <div className="nav-logo">
          mariano <span className="dim">· mtza</span>
        </div>
        <div className="nav-links">
          <a href="#top">Inicio</a>
          <a href="#stats">Eventos</a>
          <a href="#roster">Equipo</a>
          <a href="#booking">Booking</a>
        </div>
        <div className="nav-right">
          <button
            className={`sound-toggle ${audio.enabled ? '' : 'off'}`}
            onClick={() => audio.toggle()}
            title="Alternar sonido"
          >
            <span className="sound-bars">
              <span />
              <span />
              <span />
              <span />
            </span>
            Sound
          </button>
        </div>
      </div>
    </nav>
  )
}

/**
 * Footer Component - Clickable footer with scroll-to-top
 */
export function Footer() {
  const audio = useAudio()
  const year = new Date().getFullYear()

  return (
    <>
      <a
        className="footer-big"
        href="#top"
        onClick={() => {
          audio.click?.()
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        title="Volver al inicio"
        onMouseEnter={() => audio.hover?.()}
      >
        Mariano<span className="ital">·</span>Martínez
      </a>
      <footer className="footer">
        <div>© {year} · marianomtza.com</div>
        <div>{SITE_CONFIG.city}</div>
        <div className="footer-social">
          {SITE_CONFIG.instagram && (
            <a href={SITE_CONFIG.instagram} target="_blank" rel="noopener noreferrer" onMouseEnter={() => audio.hover?.()}>
              Instagram
            </a>
          )}
          <a href={`mailto:${SITE_CONFIG.email}`} onMouseEnter={() => audio.hover?.()}>
            Email
          </a>
        </div>
      </footer>
    </>
  )
}

/**
 * Band Component - Marquee for colectivos/brands
 */
export function Band({ items, label, reverse = false }) {
  return (
    <section className={`band ${reverse ? 'reverse' : ''}`}>
      <div className="band-track">
        {items.map((item, i) => (
          <React.Fragment key={`${item.name}-${i}`}>
            {item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className={`band-item ${item.name === 'LA FAMA' ? 'la-fama' : ''}`}>
                {item.name}
              </a>
            ) : (
              <span className={`band-item ${item.name === 'LA FAMA' ? 'la-fama' : ''}`}>{item.name}</span>
            )}
            {i < items.length - 1 && <span className="band-item sep">·</span>}
          </React.Fragment>
        ))}
        {/* Duplicate for seamless loop */}
        {items.map((item, i) => (
          <React.Fragment key={`${item.name}-${i}-dup`}>
            {item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className={`band-item ${item.name === 'LA FAMA' ? 'la-fama' : ''}`}>
                {item.name}
              </a>
            ) : (
              <span className={`band-item ${item.name === 'LA FAMA' ? 'la-fama' : ''}`}>{item.name}</span>
            )}
            {i < items.length - 1 && <span className="band-item sep">·</span>}
          </React.Fragment>
        ))}
      </div>
    </section>
  )
}

export { Stats } from './Stats'
export { Booking } from './Booking'
export { Roster } from './Roster'
export { Background3D } from './Background3D'
export { EasterEggs } from './EasterEggs'
export { Tweaks } from './Tweaks'

/**
 * BlobBG Component - Animated background with parallax
 */
export function BlobBG({ showStars = true }) {
  const refRef = useRef(null)
  const blobsRef = useRef([])
  const geoObjsRef = useRef([])
  const smoothedRef = useRef({ x: 0, y: 0 })
  const { pointerRef } = useMotion()

  useMotionFrame(({ reducedMotion }) => {
    if (reducedMotion) return
    const px = (pointerRef.current.nx - 0.5) * 2
    const py = (pointerRef.current.ny - 0.5) * 2
    smoothedRef.current.x += (px - smoothedRef.current.x) * 0.08
    smoothedRef.current.y += (py - smoothedRef.current.y) * 0.08

    const { x, y } = smoothedRef.current
    blobsRef.current.forEach((b, i) => {
      if (!b) return
      const k = (i + 1) * 20
      b.style.translate = `${x * k}px ${y * k}px`
    })
    geoObjsRef.current.forEach((g, i) => {
      if (!g) return
      const k = (i + 1) * 10
      g.style.translate = `${x * k}px ${y * k}px`
    })
  })

  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches
    if (isMobile && refRef.current) {
      refRef.current.style.display = 'none'
    }
  }, [])

  return (
    <div className="blob-bg" ref={refRef}>
      {showStars && <div className="stars" />}
      <div className="blob b1" ref={el => blobsRef.current[0] = el} />
      <div className="blob b2" ref={el => blobsRef.current[1] = el} />
      <div className="blob b3" ref={el => blobsRef.current[2] = el} />
      <div className="blob b4" ref={el => blobsRef.current[3] = el} />
      <div className="blob ring" ref={el => blobsRef.current[4] = el} />
      <div className="geo-obj cube" ref={el => geoObjsRef.current[0] = el} />
      <div className="geo-obj tri" ref={el => geoObjsRef.current[1] = el} />
      <div className="geo-obj diamond" ref={el => geoObjsRef.current[2] = el} />
      <div className="geo-obj ring2" ref={el => geoObjsRef.current[3] = el} />
      <div className="geo-obj dots" ref={el => geoObjsRef.current[4] = el} />
    </div>
  )
}
