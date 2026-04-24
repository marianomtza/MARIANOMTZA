'use client'

import React from 'react'
import { motion } from 'framer-motion'

const cards = [
  'Texturas y neón',
  'Arquitectura sonora',
  'Moodboard nocturno',
  'Playground visual',
  'Narrativa de club',
  'Movimientos de masa',
]

export function CreativeGallery() {
  return (
    <section className="relative min-h-screen px-6 md:px-12 py-24 bg-[radial-gradient(circle_at_top,rgba(155,95,214,0.3),transparent_45%)]">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-5xl md:text-7xl mb-6">Inspiración</h1>
        <p className="text-[var(--fg-muted)] max-w-2xl mb-16">Colección viva de referencias, ritmos y dirección creativa. Incluye el museo colaborativo de dibujos.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.article
              key={card}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)]/70 p-6 min-h-52"
            >
              <div className="text-xs uppercase tracking-[0.22em] text-[var(--fg-muted)] mb-5">Ref {String(i + 1).padStart(2, '0')}</div>
              <h2 className="text-2xl font-semibold">{card}</h2>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
