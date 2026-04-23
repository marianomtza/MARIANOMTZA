import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ROSTER_ARTISTS, Artist } from '../lib/roster'
import { useBookingActions } from '../contexts/BookingContext'

const ArtistCard: React.FC<{ 
  artist: Artist
  onSelect: (artist: Artist) => void 
}> = ({ artist, onSelect }) => {
  const { setSelectedArtist, requestBookingScroll } = useBookingActions()

  const handleQuickBook = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedArtist(artist.name)
    requestBookingScroll()
    const el = document.getElementById('reserva')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <motion.div
      layoutId={`artist-${artist.id}`}
      onClick={() => onSelect(artist)}
      className="artist-card group relative overflow-hidden rounded-3xl bg-zinc-950 border border-white/10 cursor-pointer flex flex-col justify-end p-8 min-h-[380px] hover:border-[#9b5fd6]/60 transition-all duration-500"
      whileHover={{ scale: 1.015, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      {/* Modern gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black z-10" />
      
      {/* Subtle animated accent on hover */}
      <div className="absolute inset-0 bg-[#9b5fd6] opacity-0 group-hover:opacity-[0.06] transition-opacity duration-700 z-10" />
      
      <div className="relative z-20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="font-mono text-[10px] tracking-[3px] text-[#9b5fd6] mb-2">ARTISTA • 2026</div>
            <h3 className="text-4xl font-semibold tracking-tighter text-white leading-none pr-4">{artist.name}</h3>
          </div>
          {artist.subtitle && (
            <div className="px-3 py-1 text-[9px] font-mono tracking-[1.5px] border border-[#9b5fd6]/70 text-[#9b5fd6] rounded-full self-start mt-1 whitespace-nowrap">
              {artist.subtitle}
            </div>
          )}
        </div>

        <p className="text-sm text-[#8a7fa0] mb-8 tracking-wide line-clamp-2">{artist.type}</p>

        {/* Interactive elements */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[2px] text-white/50 group-hover:text-[#9b5fd6] transition-colors">
            VER PERFIL <span className="group-hover:translate-x-0.5 transition">↗</span>
          </div>

          {/* Quick Book Button - Modern & Interactive */}
          <motion.button
            onClick={handleQuickBook}
            className="opacity-0 group-hover:opacity-100 px-5 py-2 bg-white text-black text-[10px] tracking-[1.5px] font-medium rounded-full hover:bg-[#9b5fd6] hover:text-white transition-all flex items-center gap-2 active:scale-[0.98]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            BOOK
            <span>↗</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

const ArtistModal: React.FC<{ 
  artist: Artist | null
  onClose: () => void 
}> = ({ artist, onClose }) => {
  const { setSelectedArtist, requestBookingScroll } = useBookingActions()

  if (!artist) return null

  const handleBook = () => {
    setSelectedArtist(artist.name)
    onClose()
    setTimeout(() => {
      requestBookingScroll()
      const bookingEl = document.getElementById('reserva')
      bookingEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 380)
  }

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95" 
        onClick={onClose}
      >
        <motion.div
          layoutId={`artist-${artist.id}`}
          className="relative w-full max-w-[960px] bg-zinc-950 rounded-3xl overflow-hidden border border-white/10"
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 28 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="grid md:grid-cols-5 gap-0">
            {/* Visual */}
            <div className="md:col-span-3 relative h-[380px] md:h-auto bg-zinc-900 flex items-center justify-center overflow-hidden">
              <div className="text-[220px] font-black tracking-[-10px] text-white/10 select-none">
                {artist.name.slice(0, 3)}
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(#9b5fd6_0.8px,transparent_1.5px)] bg-[length:4px_4px] opacity-15" />
            </div>

            {/* Info */}
            <div className="md:col-span-2 p-12 flex flex-col relative">
              <button 
                onClick={onClose}
                className="absolute top-9 right-9 text-white/40 hover:text-white text-2xl font-light tracking-widest transition"
              >
                ✕
              </button>

              <div className="mt-auto">
                <h2 className="text-[52px] font-semibold tracking-tighter text-white leading-none mb-5">{artist.name}</h2>
                <p className="text-xl text-[#8a7fa0] mb-10 tracking-wide">{artist.type}</p>

                {artist.subtitle && (
                  <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[1.5px] border border-white/20 px-5 py-2 rounded-full mb-12">
                    {artist.subtitle}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 mb-12">
                  {artist.spotify && (
                    <a href={artist.spotify} target="_blank" rel="noopener" 
                       className="px-6 py-3 text-xs tracking-widest border border-white/20 hover:bg-white hover:text-black transition rounded-full">
                      Spotify
                    </a>
                  )}
                  {artist.apple && (
                    <a href={artist.apple} target="_blank" rel="noopener" 
                       className="px-6 py-3 text-xs tracking-widest border border-white/20 hover:bg-white hover:text-black transition rounded-full">
                      Apple Music
                    </a>
                  )}
                  {artist.set && (
                    <a href={artist.set} target="_blank" rel="noopener" 
                       className="px-6 py-3 text-xs tracking-widest border border-white/20 hover:bg-white hover:text-black transition rounded-full">
                      SET
                    </a>
                  )}
                  {artist.instagram && (
                    <a href={artist.instagram} target="_blank" rel="noopener" 
                       className="px-6 py-3 text-xs tracking-widest border border-white/20 hover:bg-white hover:text-black transition rounded-full">
                      Instagram
                    </a>
                  )}
                </div>
              </div>

              <button
                onClick={handleBook}
                className="mt-auto w-full py-4 bg-white text-black text-xs tracking-[2px] font-medium rounded-full hover:bg-[#9b5fd6] hover:text-white transition flex items-center justify-center gap-3 group"
              >
                BOOK
                <span className="group-hover:rotate-45 transition">↗</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export const Roster: React.FC = () => {
  const [selected, setSelected] = useState<Artist | null>(null)

  return (
    <section id="artistas" className="section py-24 border-t border-white/10 bg-black">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="max-w-[620px] mb-16">
          <div className="font-mono text-xs tracking-[0.24em] text-[#9b5fd6] mb-4">ROSTER 2026</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROSTER_ARTISTS.map((artist) => (
            <ArtistCard 
              key={artist.id} 
              artist={artist} 
              onSelect={setSelected} 
            />
          ))}
        </div>

      </div>

      <ArtistModal artist={selected} onClose={() => setSelected(null)} />
    </section>
  )
}