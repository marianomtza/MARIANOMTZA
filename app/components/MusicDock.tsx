'use client'

import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Mix = { id: string; label: string; artist: string; embed: string; note: string }

const MIXES: Mix[] = [
  {
    id: 'sega-bodega',
    label: 'Sega Bodega',
    artist: 'Sega Bodega',
    embed: 'https://embed.music.apple.com/us/album/salv-go-home/1523620296?i=1523620298',
    note: 'Selección nocturna, glitch pop.',
  },
  {
    id: 'musical-monday',
    label: 'Musical Monday',
    artist: 'Curado semanal',
    embed: 'https://embed.music.apple.com/us/playlist/musical-monday/pl.u-8aAVZ6Vir6b7V',
    note: 'Opcional: lunes musical para arrancar semana.',
  },
]

export const MusicDock: React.FC = () => {
  const [expanded, setExpanded] = useState(false)
  const [mixId, setMixId] = useState(MIXES[0].id)
  const active = useMemo(() => MIXES.find((m) => m.id === mixId) ?? MIXES[0], [mixId])

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="fixed left-1/2 -translate-x-1/2 bottom-4 z-[70] w-[min(94vw,540px)] pointer-events-none">
      <div className="glass rounded-2xl overflow-hidden pointer-events-auto shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2 p-3">
          <button onClick={() => setExpanded((v) => !v)} className="btn btn-ghost" aria-expanded={expanded} aria-controls="music-picker">Apple Music</button>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] truncate">{active.label}</div>
            <div className="text-[10px] text-[var(--fg-muted)] font-mono uppercase tracking-[0.18em] truncate">{active.artist}</div>
          </div>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div id="music-picker" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-[var(--line)] overflow-hidden">
              <div className="p-2 flex gap-2 flex-wrap">
                {MIXES.map((m) => (
                  <button key={m.id} className={`px-3 py-2 text-xs rounded-full border ${m.id === active.id ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--line)]'}`} onClick={() => setMixId(m.id)}>
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="px-3 pb-2 text-xs text-[var(--fg-muted)]">{active.note}</p>
              <iframe title={`Apple Music ${active.label}`} allow="autoplay *; encrypted-media *;" frameBorder="0" height="175" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', background: 'transparent' }} sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation" src={active.embed} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
