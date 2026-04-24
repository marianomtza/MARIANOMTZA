import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Artist, ROSTER_ARTISTS } from '../lib/roster'
import { useBookingActions } from '../contexts/BookingContext'

const getRoleLabel = (artist: Artist) => {
  const subtitle = artist.subtitle?.toLowerCase().trim()
  const type = artist.type?.toLowerCase().trim()
  if (!subtitle) return artist.type
  if (subtitle === type) return artist.type
  if (type.includes(subtitle) || subtitle.includes(type)) return artist.type
  return `${artist.type} · ${artist.subtitle}`
}

export const Roster: React.FC = () => {
  const [selected, setSelected] = useState<Artist | null>(null)
  const { setSelectedArtist, requestBookingScroll } = useBookingActions()

  const artists = useMemo(() => ROSTER_ARTISTS, [])

  const reserveArtist = (artistName: string) => {
    setSelectedArtist(artistName)
    requestBookingScroll()
    document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="artistas" className="section border-t border-[color:var(--line)] bg-[color:var(--surface)] py-24">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="mb-14 max-w-[680px]">
          <p className="mb-4 text-xs tracking-[0.22em] text-[color:var(--fg-muted)]">ROSTER 2026</p>
          <h2 className="text-5xl tracking-tight text-[color:var(--fg)] md:text-6xl">Curated artists for club culture and crossover live acts.</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {artists.map((artist) => (
            <motion.button
              key={artist.id}
              layoutId={`artist-${artist.id}`}
              onClick={() => setSelected(artist)}
              className="group relative min-h-[330px] overflow-hidden rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-7 text-left"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_10%,rgba(15,15,15,0.85)_80%)]" />
              <div className="relative z-10 flex h-full flex-col justify-end">
                <p className="text-[11px] tracking-[0.2em] text-[color:var(--fg-muted)]">{getRoleLabel(artist)}</p>
                <h3 className="mt-3 text-4xl tracking-tight text-[color:var(--fg)]">{artist.name}</h3>
                <div className="mt-6 text-[11px] tracking-[0.16em] text-[color:var(--fg-muted)]">CLICK TO EXPAND</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-4 backdrop-blur-md md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setSelected(null)}
          >
            <motion.article
              layoutId={`artist-${selected.id}`}
              className="grid h-[92vh] w-full max-w-[1280px] overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-[color:var(--surface)] md:grid-cols-2"
              transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex items-center justify-center bg-[color:var(--surface-strong)]">
                <div className="text-[18vw] font-semibold leading-none tracking-[-0.05em] text-[color:var(--line)]">{selected.name.slice(0, 2)}</div>
              </div>

              <div className="flex flex-col p-8 md:p-12">
                <button onClick={() => setSelected(null)} className="ml-auto text-sm tracking-[0.18em] text-[color:var(--fg-muted)]">CERRAR</button>
                <h3 className="mt-10 text-5xl tracking-tight text-[color:var(--fg)] md:text-6xl">{selected.name}</h3>
                <p className="mt-4 text-base text-[color:var(--fg-muted)]">{getRoleLabel(selected)}</p>
                <p className="mt-8 max-w-[42ch] text-[15px] leading-relaxed text-[color:var(--fg-muted)]">
                  Artista dentro del roster de MARIANOMTZA, disponible para bookings con dirección curada, setup técnico claro y ejecución orientada a conversión de audiencia.
                </p>

                <div className="mt-10 flex flex-wrap gap-3">
                  {selected.spotify && <a href={selected.spotify} target="_blank" rel="noreferrer" className="btn btn-ghost btn-shine">Spotify</a>}
                  {selected.apple && <a href={selected.apple} target="_blank" rel="noreferrer" className="btn btn-ghost btn-shine">Apple Music</a>}
                  {selected.set && <a href={selected.set} target="_blank" rel="noreferrer" className="btn btn-ghost btn-shine">Live Set</a>}
                  {selected.instagram && <a href={selected.instagram} target="_blank" rel="noreferrer" className="btn btn-ghost btn-shine">Instagram</a>}
                </div>

                <button onClick={() => reserveArtist(selected.name)} className="btn btn-primary btn-shine mt-auto self-start">
                  Reservar artista
                </button>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
