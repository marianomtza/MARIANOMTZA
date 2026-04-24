'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ROSTER_ARTISTS, Artist } from '../lib/roster'
import { useBookingActions } from '../contexts/BookingContext'

const EASE = [0.22, 1, 0.36, 1] as const

interface CardProps {
  artist: Artist
  onSelect: (artist: Artist) => void
  isSelected: boolean
}

const ArtistCard: React.FC<CardProps> = ({ artist, onSelect, isSelected }) => {
  return (
    <motion.button
      layoutId={`artist-${artist.id}-card`}
      onClick={() => onSelect(artist)}
      style={{ visibility: isSelected ? 'hidden' : 'visible' }}
      className="artist-card group relative text-left overflow-hidden rounded-[20px] bg-[var(--bg-elevated)] border border-[var(--line)] cursor-pointer flex flex-col justify-end p-7 min-h-[340px] transition-colors hover:border-[var(--accent)]/50"
    >
      <motion.div
        layoutId={`artist-${artist.id}-bg`}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, var(--accent-glow) 0%, transparent 55%)',
          opacity: 0.45,
        }}
      />
      <div className="relative z-[2] flex flex-col gap-5 h-full">
        <div className="flex items-start justify-between">
          <motion.div
            layoutId={`artist-${artist.id}-eyebrow`}
            className="font-mono text-[10px] tracking-[0.28em] text-[var(--accent)] uppercase"
          >
            · {String(artist.id).padStart(2, '0')} / Roster
          </motion.div>
          {artist.crew && (
            <motion.div
              layoutId={`artist-${artist.id}-crew`}
              className="px-2.5 py-0.5 text-[9px] font-mono tracking-[0.2em] border border-[var(--line-strong)] text-[var(--fg-muted)] rounded-full"
            >
              {artist.crew}
            </motion.div>
          )}
        </div>

        <div className="flex-1" />

        <div>
          <motion.h3
            layoutId={`artist-${artist.id}-name`}
            className="font-display text-[44px] md:text-[48px] leading-[0.92] tracking-[-0.02em] text-[var(--fg)] mb-2 break-words"
          >
            {artist.name}
          </motion.h3>
          <motion.p
            layoutId={`artist-${artist.id}-role`}
            className="text-[var(--fg-muted)] text-sm tracking-wide"
          >
            {artist.role}
          </motion.p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--fg-muted)] group-hover:text-[var(--accent)] transition-colors flex items-center gap-1.5">
            Ver perfil <span className="transition-transform group-hover:translate-x-0.5">↗</span>
          </div>
        </div>
      </div>
    </motion.button>
  )
}

interface ExpandedProps {
  artist: Artist
  onClose: () => void
}

const ArtistExpanded: React.FC<ExpandedProps> = ({ artist, onClose }) => {
  const { setSelectedArtist, requestBookingScroll } = useBookingActions()

  const handleBook = useCallback(() => {
    setSelectedArtist(artist.name)
    onClose()
    window.setTimeout(() => {
      requestBookingScroll()
      const el = document.getElementById('reserva')
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 450)
  }, [artist.name, onClose, requestBookingScroll, setSelectedArtist])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const links = [
    { label: 'Spotify', href: artist.spotify },
    { label: 'Apple Music', href: artist.apple },
    { label: 'Set', href: artist.set },
    { label: 'Instagram', href: artist.instagram },
  ].filter((l) => l.href)

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch justify-stretch">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.38, ease: EASE }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-xl"
      />

      {/* Expansion */}
      <motion.div
        layoutId={`artist-${artist.id}-card`}
        transition={{ duration: 0.55, ease: EASE }}
        className="relative z-10 m-4 md:m-8 rounded-[28px] bg-[var(--bg-elevated)] border border-[var(--line)] overflow-hidden flex-1 max-w-[1240px] mx-auto grid md:grid-cols-2"
      >
        <motion.div
          layoutId={`artist-${artist.id}-bg`}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, var(--accent-glow) 0%, transparent 60%)',
            opacity: 0.55,
          }}
        />

        {/* Visual side */}
        <div className="relative flex items-center justify-center p-10 md:p-16 min-h-[340px] border-b md:border-b-0 md:border-r border-[var(--line)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.18 }}
            className="absolute inset-8 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              background:
                'radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)',
            }}
          >
            <div
              className="font-display text-[clamp(3rem,18vw,11rem)] leading-none tracking-[-0.05em] opacity-20 text-[var(--fg)]"
              aria-hidden
            >
              {artist.name.slice(0, 3)}
            </div>
          </motion.div>
        </div>

        {/* Content side */}
        <div className="relative p-10 md:p-16 flex flex-col justify-between gap-10 z-[2]">
          <motion.button
            onClick={onClose}
            className="absolute top-6 right-6 h-9 w-9 rounded-full border border-[var(--line-strong)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--accent)] transition flex items-center justify-center"
            aria-label="Cerrar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            ✕
          </motion.button>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                layoutId={`artist-${artist.id}-eyebrow`}
                className="font-mono text-[10px] tracking-[0.28em] text-[var(--accent)] uppercase"
              >
                · {String(artist.id).padStart(2, '0')} / Roster
              </motion.div>
              {artist.crew && (
                <motion.div
                  layoutId={`artist-${artist.id}-crew`}
                  className="px-2.5 py-0.5 text-[9px] font-mono tracking-[0.2em] border border-[var(--line-strong)] text-[var(--fg-muted)] rounded-full"
                >
                  {artist.crew}
                </motion.div>
              )}
            </div>

            <motion.h2
              layoutId={`artist-${artist.id}-name`}
              className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-[0.9] tracking-[-0.02em] text-[var(--fg)] mb-4"
            >
              {artist.name}
            </motion.h2>

            <motion.p
              layoutId={`artist-${artist.id}-role`}
              className="text-[var(--fg-muted)] text-lg tracking-wide mb-8"
            >
              {artist.role}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28, ease: EASE }}
              className="font-editorial text-[20px] leading-[1.45] text-[var(--fg)] max-w-[44ch]"
            >
              {artist.bio ??
                'Contacta booking para recibir materiales completos, riders y disponibilidad.'}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.36, ease: EASE }}
            className="space-y-6"
          >
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-[11px] tracking-[0.18em] uppercase border border-[var(--line-strong)] rounded-full hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
            <button onClick={handleBook} className="btn btn-primary w-full md:w-auto">
              <span>Reservar a {artist.name}</span>
              <span aria-hidden>↗</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export const Roster: React.FC = () => {
  const [selected, setSelected] = useState<Artist | null>(null)

  return (
    <section id="artistas" className="section py-28 border-t border-[var(--line)] bg-[var(--bg)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="mb-14">
          <div className="font-mono text-[11px] tracking-[0.28em] text-[var(--accent)] mb-4 uppercase">
            Roster · 2026
          </div>
          <h2 className="fluid-h2 font-display text-[var(--fg)] max-w-[18ch]">
            Artistas curados con identidad propia.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROSTER_ARTISTS.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onSelect={setSelected}
              isSelected={selected?.id === artist.id}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && <ArtistExpanded key={selected.id} artist={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  )
}
