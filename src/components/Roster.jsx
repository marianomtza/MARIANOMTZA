import React, { useCallback, useRef } from 'react'
import { useAudio } from '../contexts/AudioContext'
import { useBookingActions, useBookingState } from '../contexts/BookingContext'
import { ROSTER_ARTISTS } from '../data/roster'

const CARD_COLORS = [
  '#7C3AED', '#a855f7', '#9333ea', '#8b5cf6', '#c084fc',
  '#7e22ce', '#6d28d9', '#4c1d95', '#a78bfa', '#5b21b6',
]

function ArtistCard({ artist, index, onClick, isActive }) {
  const color = CARD_COLORS[index % CARD_COLORS.length]
  const initials = artist.name.replace(/[^A-Z0-9]/gi, '').slice(0, 2).toUpperCase()
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current || window.matchMedia('(pointer: coarse)').matches) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    
    cardRef.current.style.transform = `scale(1.02) rotateX(${y * -10}deg) rotateY(${x * 10}deg)`
    cardRef.current.style.setProperty('--mx', `${50 + x * 50}%`)
    cardRef.current.style.setProperty('--my', `${50 + y * 50}%`)
    cardRef.current.style.zIndex = '10'
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'scale(1) rotateX(0deg) rotateY(0deg)'
    cardRef.current.style.setProperty('--mx', '50%')
    cardRef.current.style.setProperty('--my', '50%')
    cardRef.current.style.zIndex = '1'
  }

  return (
    <button
      ref={cardRef}
      type="button"
      className={`roster-card ${artist.featured ? 'featured' : ''} ${isActive ? 'active' : ''}`}
      onClick={() => onClick(artist.name)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={`Seleccionar ${artist.name}`}
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
      <div className="roster-cta">{isActive ? 'Seleccionado ✓' : 'Book →'}</div>
    </button>
  )
}

export function Roster() {
  const audio = useAudio()
  const { setSelectedArtist, requestBookingScroll } = useBookingActions()
  const { selectedArtist } = useBookingState()

  const handleSelectArtist = useCallback((artistName) => {
    audio?.click?.()
    setSelectedArtist(artistName)
    setTimeout(() => {
      requestBookingScroll()
    }, 150)
  }, [audio, requestBookingScroll, setSelectedArtist])

  return (
    <section className="section" id="roster">
      <div className="wrap">
        <div className="section-intro reveal-stagger">
          <div className="side">01 — Roster</div>
          <h2 className="section-h">TALENTO <span className="ital">Curado</span></h2>
        </div>
        <div className="roster-grid reveal-stagger">
          {ROSTER_ARTISTS.map((a, i) => (
            <ArtistCard
              key={a.name}
              artist={a}
              index={i}
              isActive={selectedArtist === a.name}
              onClick={handleSelectArtist}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
