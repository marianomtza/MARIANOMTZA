import React, { useState, useEffect } from 'react'
import { useAudio } from '../contexts/AudioContext'
import { useBooking } from '../contexts/BookingContext'
import { buildWhatsAppLink } from '../utils/whatsapp'
import { SITE_CONFIG } from '../constants'

const ROSTER = [
  {
    name: '3DELINCUENTES',
    apple: '',
    spotify: '',
    ig: '',
  },
  {
    name: 'RUZZO DOBLEZZ',
    label: 'LAFAMA',
    apple: '',
    spotify: '',
    ig: '',
  },
  {
    name: '8.AM',
    label: 'LAFAMA',
    apple: '',
    spotify: '',
    ig: '',
  },
  {
    name: 'MORROW',
    label: 'LAFAMA',
    apple: '',
    spotify: '',
    ig: '',
  },
  {
    name: 'BBBARTEX',
    label: 'LAFAMA',
    apple: '',
    spotify: '',
    ig: '',
  },
  {
    name: 'LEGORRETA',
    genre: 'DJ / Producer',
    label: 'LAFAMA',
    apple: '',
    spotify: '',
    ig: '',
  },
  {
    name: 'TBX',
    genre: 'DJ / Producer',
    label: 'LAFAMA',
    apple: '',
    spotify: '',
    ig: '',
  },
  {
    name: 'NZO',
    label: 'LAFAMA',
    apple: '',
    spotify: '',
    ig: '',
  },
  {
    name: 'ELAKKKA',
    genre: 'Producer',
    label: 'LAFAMA',
    apple: '',
    spotify: '',
    ig: '',
  },
  {
    name: 'MOODJAAS',
    genre: 'DJ / Producer',
    label: 'LAFAMA',
    apple: '',
    spotify: '',
    ig: '',
  },
]

const CARD_COLORS = [
  '#7C3AED',
  '#a855f7',
  '#9333ea',
  '#8b5cf6',
  '#c084fc',
  '#7e22ce',
  '#6d28d9',
  '#4c1d95',
  '#a78bfa',
  '#5b21b6',
]

function ArtistCard({ artist, index, onClick }) {
  const [popping, setPopping] = useState(false)
  const color = CARD_COLORS[index % CARD_COLORS.length]
  const initials = artist.name
    .replace(/[^A-Z0-9]/gi, '')
    .slice(0, 2)
    .toUpperCase()

  const handleClick = () => {
    setPopping(true)
    setTimeout(() => {
      setPopping(false)
      onClick(index)
    }, 280)
  }

  return (
    <button
      type="button"
      className={`roster-card ${popping ? 'popping' : ''}`}
      onClick={handleClick}
      aria-label={`Ver ${artist.name}`}
    >
      <div className="roster-avatar" style={{ background: color }}>
        {artist.photo ? (
          <img src={artist.photo} alt={artist.name} />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className="roster-card-info">
        <div className="roster-name">{artist.name}</div>
        <div className="roster-genre">{artist.genre}</div>
        {artist.label && <div className="roster-label-badge">{artist.label}</div>}
      </div>
      <div className="roster-cta">Book →</div>
    </button>
  )
}

function ArtistModal({ artist, index, onClose, audio }) {
  const a = artist
  const color = CARD_COLORS[index % CARD_COLORS.length]
  const initials = a.name
    .replace(/[^A-Z0-9]/gi, '')
    .slice(0, 2)
    .toUpperCase()

  const { setSelectedArtist, scrollToBooking } = useBooking()

  // Prevent scroll on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const bookArtist = () => {
    audio?.click?.()

    if (SITE_CONFIG.whatsapp) {
      const url = buildWhatsAppLink(SITE_CONFIG.whatsapp, `RESERVA TU NOCHE - ${a.name}`)
      window.open(url, '_blank')
    } else {
      // Fallback: trigger form via React state
      onClose()
      setSelectedArtist(a.name)
      setTimeout(() => {
        scrollToBooking()
      }, 100)
    }
  }

  return (
    <div
      className="artist-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={a.name}
    >
      <div
        className="artist-modal-panel pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="artist-modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <div className="artist-modal-photo" style={{ background: color }}>
          {a.photo ? (
            <img src={a.photo} alt={a.name} />
          ) : (
            <div className="artist-photo-placeholder">{initials}</div>
          )}
          {a.label && <div className="artist-modal-label">{a.label}</div>}
        </div>

        <div className="artist-modal-info">
          <h3 className="artist-modal-name">{a.name}</h3>
          <p className="artist-modal-genre">{a.genre}</p>
          {a.label && a.name !== '3DELINCUENTES' && (
            <div className="artist-modal-label-centered">{a.label}</div>
          )}

          <div className="artist-modal-links">
            {a.ig && (
              <a
                href={a.ig}
                target="_blank"
                rel="noopener noreferrer"
                className="artist-link-btn ig"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Instagram
              </a>
            )}
            {a.spotify && (
              <a
                href={a.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="artist-link-btn spotify"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                Spotify
              </a>
            )}
            {a.apple && (
              <a
                href={a.apple}
                target="_blank"
                rel="noopener noreferrer"
                className="artist-link-btn apple"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                </svg>
                Apple Music
              </a>
            )}
          </div>

          <button
            className="btn primary big artist-book-btn"
            onClick={bookArtist}
          >
            RESERVA TU NOCHE <span className="arr">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function Roster() {
  const audio = useAudio()
  const [active, setActive] = useState(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section className="section" id="roster">
      <div className="wrap">
        <div className="section-intro reveal-stagger">
          <div className="side">06 — Roster</div>
          <h2 className="section-h">ARTISTAS</h2>
        </div>
        <div className="roster-grid reveal-stagger">
          {ROSTER.map((a, i) => (
            <ArtistCard
              key={a.name}
              artist={a}
              index={i}
              onClick={(idx) => {
                audio?.click?.()
                setActive(idx)
              }}
            />
          ))}
        </div>
      </div>

      {active !== null && (
        <ArtistModal
          artist={ROSTER[active]}
          index={active}
          onClose={() => setActive(null)}
          audio={audio}
        />
      )}
    </section>
  )
}
