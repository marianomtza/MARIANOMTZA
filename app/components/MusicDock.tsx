'use client'

import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Mix = { id: string; label: string; artist: string; embed: string; note: string }

const MIXES: Mix[] = [
  {
    id: 'musical-monday',
    label: 'Musical Monday',
    artist: 'Curado semanal',
    embed: 'https://embed.music.apple.com/us/playlist/musical-monday/pl.u-8aAVZ6Vir6b7V',
    note: 'Selección principal para activar el mood semanal.',
  },
  {
    id: 'sega-bodega',
    label: 'Sega Bodega',
    artist: 'Sega Bodega',
    embed: 'https://embed.music.apple.com/us/album/salv-go-home/1523620296?i=1523620298',
    note: 'Extra opcional. Arquitectura abierta para más mixes.',
  },
]

export const MusicDock: React.FC = () => {
  const [expanded, setExpanded] = useState(true)
  const [mixId, setMixId] = useState(MIXES[0].id)
  const [failed, setFailed] = useState(false)
  const active = useMemo(() => MIXES.find((m) => m.id === mixId) ?? MIXES[0], [mixId])

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="fixed left-1/2 -translate-x-1/2 bottom-4 z-[70] w-[min(94vw,560px)] pointer-events-none">
      <div className="glass rounded-2xl overflow-hidden pointer-events-auto shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2 p-3">
          <button onClick={() => setExpanded((v) => !v)} className="btn btn-ghost min-h-[44px]" aria-expanded={expanded} aria-controls="music-picker">Apple Music</button>
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
                  <button key={m.id} className={`px-3 py-2 text-xs rounded-full border min-h-[40px] ${m.id === active.id ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--line)]'}`} onClick={() => { setMixId(m.id); setFailed(false) }}>
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="px-3 pb-1 text-xs text-[var(--fg-muted)]">{active.note}</p>
              <a href={active.embed} target="_blank" rel="noreferrer" className="px-3 pb-2 block text-[11px] text-[var(--accent)]">Abrir en Apple Music ↗</a>
              {failed ? (
                <div className="px-3 pb-3 text-xs text-[var(--fg-muted)]">No se pudo cargar el reproductor. Abre Musical Monday en Apple Music.</div>
              ) : (
                <iframe
                  key={active.id}
                  title={`Apple Music ${active.label}`}
                  allow="autoplay *; encrypted-media *;"
                  frameBorder="0"
                  height="175"
                  loading="lazy"
                  onError={() => setFailed(true)}
                  style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', background: 'transparent' }}
                  sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation"
                  src={active.embed}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
