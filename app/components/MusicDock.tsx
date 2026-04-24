'use client'

import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Mix = {
  id: string
  title: string
  artist: string
  embed: string
  href: string
}

const MIXES: Mix[] = [
  {
    id: 'musical-monday-001',
    title: 'Musical Monday 001',
    artist: 'Marianomtza',
    embed: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/marianomtza/musical-monday-001&color=%238b5cf6&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false',
    href: 'https://soundcloud.com/marianomtza/musical-monday-001',
  },
  {
    id: 'sega-bodega-cut',
    title: 'Sega Bodega — Selection',
    artist: 'Sega Bodega',
    embed: 'https://www.youtube.com/embed/UV5fTHN5E5g',
    href: 'https://www.youtube.com/watch?v=UV5fTHN5E5g',
  },
]

export const MusicDock: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState(MIXES[0].id)
  const active = useMemo(() => MIXES.find((mix) => mix.id === activeId) ?? MIXES[0], [activeId])

  return (
    <motion.aside
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="fixed right-4 bottom-4 z-[75] w-[min(94vw,420px)] pointer-events-none"
    >
      <div className="glass rounded-2xl border border-[var(--line-strong)] pointer-events-auto overflow-hidden">
        <div className="flex items-center justify-between p-3">
          <div>
            <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[var(--accent)]">
              Musical Monday
            </div>
            <div className="text-sm text-[var(--fg-muted)]">Mixes seleccionados</div>
          </div>
          <button className="btn btn-ghost !px-4 !py-2" onClick={() => setOpen((v) => !v)}>
            {open ? 'Ocultar' : 'Escuchar'}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-[var(--line)]"
            >
              <div className="p-3 flex flex-col gap-2">
                {MIXES.map((mix) => (
                  <button
                    key={mix.id}
                    onClick={() => setActiveId(mix.id)}
                    className={`text-left rounded-xl border px-3 py-2 transition ${
                      active.id === mix.id
                        ? 'border-[var(--accent)] bg-[var(--bg-elevated)]'
                        : 'border-[var(--line)] hover:border-[var(--line-strong)]'
                    }`}
                  >
                    <div className="text-sm text-[var(--fg)]">{mix.title}</div>
                    <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--fg-muted)]">
                      {mix.artist}
                    </div>
                  </button>
                ))}
              </div>

              <div className="px-3 pb-3">
                <div className="rounded-xl overflow-hidden border border-[var(--line)] bg-black/40">
                  <iframe
                    title={active.title}
                    src={active.embed}
                    width="100%"
                    height="166"
                    loading="lazy"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <a href={active.href} target="_blank" rel="noreferrer" className="link-underline mt-2 inline-block text-sm text-[var(--fg-muted)]">
                  Abrir en plataforma ↗
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}
