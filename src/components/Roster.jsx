import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ROSTER_ARTISTS } from '../data/roster'
import { useBookingActions } from '../contexts/BookingContext'

const ArtistCard = ({ artist, index, onSelect }) => {
  const isLarge = index % 5 === 0
  const isMedium = index % 3 === 0 && !isLarge

  return (
    <motion.div
      layoutId={`artist-${artist.id}`}
      onClick={() => onSelect(artist)}
      className={`
        group relative overflow-hidden rounded-2xl bg-zinc-950/80 border border-white/10 cursor-pointer
        flex flex-col justify-end p-8 transition-all duration-500
        ${isLarge ? 'col-span-2 row-span-2 min-h-[520px]' : ''}
        ${isMedium ? 'col-span-2 min-h-[380px]' : 'min-h-[280px]'}
        hover:border-[#9b5fd6]/60 hover:-translate-y-1
      `}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black/90 z-10" />
      
      {/* Artist Initial / Photo */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-all duration-700">
        <div className="text-[120px] font-black tracking-tighter text-white/30 select-none">
          {artist.name.slice(0, 2)}
        </div>
      </div>

      <div className="relative z-20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] tracking-[3px] text-[#9b5fd6] mb-1">ARTIST</div>
            <h3 className="text-3xl font-semibold tracking-tight text-white leading-none">{artist.name}</h3>
          </div>
          {artist.label && (
            <div className="px-3 py-1 text-[9px] font-mono tracking-[1px] border border-[#9b5fd6]/50 text-[#9b5fd6] rounded-full self-start">
              {artist.label}
            </div>
          )}
        </div>

        <p className="text-sm text-[#8a7fa0] mb-6">{artist.genre}</p>

        <div className="flex gap-4 text-xs uppercase tracking-widest text-white/50 group-hover:text-[#9b5fd6] transition-colors">
          <span>VIEW PROFILE</span>
          <span className="group-hover:translate-x-1 transition">→</span>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 bg-[#9b5fd6] opacity-0 group-hover:opacity-[0.035] transition-opacity duration-500 z-10" />
    </motion.div>
  )
}

const ArtistModal = ({ artist, onClose }) => {
  const { setSelectedArtist, requestBookingScroll } = useBookingActions()

  const handleBook = () => {
    setSelectedArtist(artist.name)
    onClose()
    setTimeout(() => {
      requestBookingScroll()
      const booking = document.getElementById('booking')
      booking?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 420)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95" onClick={onClose}>
        <motion.div
          layoutId={`artist-${artist.id}`}
          className="relative w-full max-w-[920px] bg-zinc-950 rounded-3xl overflow-hidden border border-white/10"
          initial={{ opacity: 0, scale: 0.96, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 30 }}
          transition={{ type: 'spring', stiffness: 180, damping: 26 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="grid md:grid-cols-5 gap-0">
            {/* Visual / Image area */}
            <div className="md:col-span-3 relative h-[420px] md:h-auto bg-zinc-900 flex items-center justify-center overflow-hidden">
              <div className="text-[180px] font-black tracking-[-6px] text-white/10 select-none">
                {artist.name.slice(0, 3)}
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(#9b5fd6_0.6px,transparent_1px)] bg-[length:3px_3px] opacity-20" />
            </div>

            {/* Info */}
            <div className="md:col-span-2 p-12 flex flex-col">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 text-white/40 hover:text-white text-xl transition"
              >
                ✕
              </button>

              <div className="mt-auto">
                <div className="uppercase tracking-[3px] text-xs text-[#9b5fd6] mb-2">TALENTO CURADO</div>
                <h2 className="text-5xl font-semibold tracking-tighter text-white leading-none mb-4">{artist.name}</h2>
                <p className="text-lg text-[#8a7fa0] mb-8">{artist.genre}</p>

                {artist.label && (
                  <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest border border-white/20 px-4 py-1.5 rounded-full mb-10">
                    {artist.label}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 mb-10">
                  {artist.spotify && (
                    <a href={artist.spotify} target="_blank" className="px-5 py-2.5 text-xs tracking-widest border border-white/20 hover:bg-white hover:text-black transition rounded-full">SPOTIFY</a>
                  )}
                  {artist.ig && (
                    <a href={artist.ig} target="_blank" className="px-5 py-2.5 text-xs tracking-widest border border-white/20 hover:bg-white hover:text-black transition rounded-full">INSTAGRAM</a>
                  )}
                </div>
              </div>

              <button
                onClick={handleBook}
                className="mt-auto w-full py-4 bg-white text-black text-xs tracking-[2px] font-medium rounded-full hover:bg-[#9b5fd6] hover:text-white transition flex items-center justify-center gap-3 group"
              >
                BOOK THIS ARTIST
                <span className="group-hover:rotate-45 transition">↗</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export const Roster = () => {
  const [selectedArtist, setSelectedArtist] = useState(null)

  return (
    <section id="roster" className="section py-24 border-t border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="section-intro mb-16">
          <div>
            <div className="font-mono text-xs tracking-[0.24em] text-[#9b5fd6] mb-4">ROSTER 2025</div>
            <h2 className="section-h text-balance">Curated.<br />Intentional.<br /><span className="ital">Unforgettable.</span></h2>
          </div>
          <div className="text-[#8a7fa0] max-w-[38ch] text-[15px] pt-4">
            A carefully selected collective of producers and DJs shaping the sound of Mexico City nights.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[minmax(280px,auto)] gap-px bg-white/10 p-px rounded-3xl overflow-hidden">
          {ROSTER_ARTISTS.map((artist, index) => (
            <ArtistCard 
              key={artist.id} 
              artist={artist} 
              index={index} 
              onSelect={setSelectedArtist} 
            />
          ))}
        </div>

        <div className="text-center mt-12 text-xs tracking-widest text-white/40 font-mono">HOVER TO EXPLORE • CLICK TO BOOK</div>
      </div>

      <AnimatePresence>
        {selectedArtist && (
          <ArtistModal 
            artist={selectedArtist} 
            onClose={() => setSelectedArtist(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  )
}

export default Roster
