import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ROSTER_ARTISTS, Artist } from '../lib/roster'
import { useBookingActions } from '../contexts/BookingContext'

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, '').replace('/', '')

const ArtistCard: React.FC<{ artist: Artist; onSelect: (artist: Artist) => void }> = ({ artist, onSelect }) => {
  const cleanSubtitle = useMemo(() => {
    if (!artist.subtitle) return ''
    return normalize(artist.subtitle) === normalize(artist.type) ? '' : artist.subtitle
  }, [artist.subtitle, artist.type])

  return (
    <motion.button
      layoutId={`artist-${artist.id}`}
      onClick={() => onSelect(artist)}
      className="artist-card group relative flex min-h-[340px] w-full flex-col justify-end overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-7 text-left"
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_90%_95%,rgba(216,201,184,0.13)_0%,rgba(0,0,0,0)_48%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10">
        <p className="mb-5 font-mono text-[10px] tracking-[0.22em] text-[var(--fg-dim)]">ROSTER</p>
        <h3 className="text-4xl font-semibold tracking-tight text-[var(--fg)]">{artist.name}</h3>
        <p className="mt-3 text-sm text-[var(--fg-dim)]">{artist.type}</p>
        {cleanSubtitle && <p className="mt-2 text-xs tracking-[0.18em] text-[var(--muted-accent)]">{cleanSubtitle}</p>}
      </div>
    </motion.button>
  )
}

export const Roster: React.FC = () => {
  const [selected, setSelected] = useState<Artist | null>(null)
  const { setSelectedArtist, requestBookingScroll } = useBookingActions()

  const close = () => setSelected(null)

  const bookSelected = () => {
    if (!selected) return
    setSelectedArtist(selected.name)
    close()
    setTimeout(() => {
      requestBookingScroll()
      document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 420)
  }

  return (
    <section id="artistas" className="section border-t border-[var(--line)] py-24">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <h2 className="mb-12 text-[44px] font-semibold tracking-tight">Roster</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ROSTER_ARTISTS.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} onSelect={setSelected} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={close}
          >
            <motion.article
              layoutId={`artist-${selected.id}`}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-full overflow-auto bg-[var(--bg)]"
              initial={{ opacity: 0.98 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.96 }}
              transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <div className="mx-auto grid min-h-screen max-w-[1400px] gap-10 px-6 py-10 md:grid-cols-2 md:px-12">
                <div className="relative flex min-h-[55vh] items-end rounded-3xl border border-[var(--line)] bg-[radial-gradient(120%_100%_at_100%_0%,rgba(203,189,172,0.2)_0%,rgba(0,0,0,0)_62%)] p-8">
                  <div>
                    <p className="font-mono text-xs tracking-[0.24em] text-[var(--fg-dim)]">ARTISTA</p>
                    <h3 className="mt-3 text-6xl font-semibold tracking-tight">{selected.name}</h3>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-10 py-4">
                  <div>
                    <button onClick={close} className="mb-8 text-sm tracking-[0.2em] text-[var(--fg-dim)]">
                      CERRAR
                    </button>
                    <p className="text-lg text-[var(--fg-dim)]">{selected.type}</p>
                    <p className="mt-7 max-w-[50ch] text-[15px] leading-relaxed text-[var(--fg-dim)]">
                      Perfil curado para shows, festivales y activaciones de marca. Disponibilidad y formato sujetos a ciudad, venue y objetivo del evento.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {selected.spotify && <a className="btn btn-ghost" href={selected.spotify} target="_blank" rel="noopener">Spotify</a>}
                    {selected.apple && <a className="btn btn-ghost" href={selected.apple} target="_blank" rel="noopener">Apple</a>}
                    {selected.set && <a className="btn btn-ghost" href={selected.set} target="_blank" rel="noopener">Set</a>}
                    <a className="btn btn-ghost" href={selected.instagram} target="_blank" rel="noopener">Instagram</a>
                  </div>

                  <button onClick={bookSelected} className="btn btn-primary w-full md:w-auto">
                    Solicitar booking
                  </button>
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
