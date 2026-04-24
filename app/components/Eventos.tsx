'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface Event {
  id: number
  title: string
  month: string
  year: string
  city: string
  venue: string
  link: string
  kind: string
}

const EVENTS: Event[] = [
  {
    id: 1,
    month: 'NOV',
    year: '2024',
    title: 'MUTEK MX · Club Furia × Lapi',
    city: 'Ciudad de México',
    venue: 'MUTEK',
    kind: 'Festival',
    link: 'https://mexico.mutek.org/es/eventos/2024/colaboracion-especial-con-club-furia-x-lapi',
  },
  {
    id: 2,
    month: 'SEP',
    year: '2024',
    title: 'Cercle Odyssey CDMX',
    city: 'Ciudad de México',
    venue: 'CDMX',
    kind: 'Festival',
    link: 'https://www.youtube.com/watch?v=UzPRso975PM',
  },
  {
    id: 3,
    month: 'AGO',
    year: '2024',
    title: 'Knockout · Lago Algo w/ Vegyn',
    city: 'Ciudad de México',
    venue: 'Lago Algo',
    kind: 'Club Night',
    link: 'https://www.instagram.com/p/DNMhSKwx-uP/',
  },
  {
    id: 4,
    month: 'JUN',
    year: '2024',
    title: 'Algo Bien · Pride',
    city: 'Ciudad de México',
    venue: 'Algo Bien',
    kind: 'Pride',
    link: 'https://www.youtube.com/watch?v=8GasfuDe4Dg',
  },
  {
    id: 5,
    month: 'MAR',
    year: '2024',
    title: 'Keep Hush CDMX',
    city: 'Ciudad de México',
    venue: 'Keep Hush',
    kind: 'Club Series',
    link: 'https://www.youtube.com/playlist?list=PLhON8BygM1nIeGSsda4c5IvGvAbHyMysv',
  },
]

export const Eventos: React.FC = () => {
  return (
    <section
      id="eventos"
      className="section py-28 border-t border-[var(--line)] bg-[var(--bg)]"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="mb-14">
          <div className="font-mono text-[11px] tracking-[0.28em] text-[var(--accent)] mb-4 uppercase">
            Noches · Archivo
          </div>
          <h2 className="fluid-h2 font-display text-[var(--fg)] max-w-[18ch]">
            Noches memorables.
          </h2>
        </div>

        <div className="border-t border-[var(--line-strong)]">
          {EVENTS.map((event, i) => (
            <motion.a
              key={event.id}
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="group grid grid-cols-12 gap-4 md:gap-8 items-baseline py-7 md:py-10 border-b border-[var(--line)] hover:bg-[var(--bg-elevated)]/40 transition-colors px-2 -mx-2"
            >
              {/* Date */}
              <div className="col-span-3 md:col-span-2 font-mono text-[11px] tracking-[0.22em] text-[var(--fg-muted)] uppercase tabular-nums">
                <span className="block text-[var(--fg)] text-[13px] font-medium">{event.month}</span>
                <span>{event.year}</span>
              </div>

              {/* Title */}
              <div className="col-span-9 md:col-span-6">
                <h3 className="font-display text-[clamp(1.5rem,2.6vw,2.2rem)] leading-[0.98] tracking-[-0.02em] text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors duration-300">
                  {event.title}
                </h3>
              </div>

              {/* Venue */}
              <div className="hidden md:flex col-span-3 items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-[var(--fg-muted)] uppercase">
                <span className="w-1 h-1 rounded-full bg-[var(--line-strong)] inline-block" />
                {event.venue}
              </div>

              {/* Arrow */}
              <div className="col-span-12 md:col-span-1 flex items-center justify-between md:justify-end gap-3">
                <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--fg-muted)] uppercase md:hidden">
                  {event.venue} · {event.kind}
                </span>
                <span className="text-[var(--fg-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition duration-300">
                  ↗
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-8 font-mono text-[11px] tracking-[0.22em] text-[var(--fg-muted)] uppercase">
          Más de 4,000 asistentes por evento · Ciudad de México
        </div>
      </div>
    </section>
  )
}
