import React, { useState, useRef, useEffect } from 'react'
import { useAudio } from '../contexts/AudioContext'
import { useTheme } from '../contexts/ThemeContext'
import { useEventListener } from '../hooks/useAnimations'
import { SITE_CONFIG } from '../constants'

/**
 * Nav Component - Fixed navigation with sound toggle
 */
export function Nav() {
  const audio = useAudio()
  const [revealed, setRevealed] = useState(false)

  useEventListener(
    'scroll',
    () => {
      setRevealed(window.scrollY > 100)
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
          <a href="#eventos">Eventos</a>
          <a href="#equipo">Equipo</a>
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

/**
 * Stats Component - Key statistics with glow effect
 */
export function Stats() {
  const stats = [
    { label: 'Noches', value: '500+' },
    { label: 'Asistentes', value: '4000+' },
    { label: 'Años', value: '10+' },
  ]

  return (
    <section className="stats-section">
      <div className="wrap">
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-n">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * BlobBG Component - Animated background with parallax
 */
export function BlobBG({ showStars = true }) {
  const refRef = useRef(null)

  useEventListener(
    'mousemove',
    (e) => {
      const el = refRef.current
      if (!el) return
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      el.querySelectorAll('.blob').forEach((b, i) => {
        const k = (i + 1) * 28
        b.style.translate = `${x * k}px ${y * k}px`
      })
      el.querySelectorAll('.geo-obj').forEach((g, i) => {
        const k = (i + 1) * 12
        g.style.translate = `${x * k}px ${y * k}px`
      })
    },
    window
  )

  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches
    if (isMobile && refRef.current) {
      refRef.current.style.display = 'none'
    }
  }, [])

  return (
    <div className="blob-bg" ref={refRef}>
      {showStars && <div className="stars" />}
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
      <div className="blob b4" />
      <div className="blob ring" />
      <div className="geo-obj cube" />
      <div className="geo-obj tri" />
      <div className="geo-obj diamond" />
      <div className="geo-obj ring2" />
      <div className="geo-obj dots" />
    </div>
  )
}
