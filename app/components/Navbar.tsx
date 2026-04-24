'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setIsOpen(false)
  }

  const sectionLinks = [
    { label: 'Roster', id: 'artistas' },
    { label: 'Eventos', id: 'eventos' },
    { label: 'Booking', id: 'reserva' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--bg)]/80 backdrop-blur-2xl border-b border-[var(--line)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-mono text-[11px] tracking-[0.28em] uppercase text-[var(--fg)] hover:text-[var(--accent)] transition"
        >
          marianomtza
        </button>

        <div className="hidden md:flex items-center gap-7 text-[11px] tracking-[0.22em] font-mono uppercase">
          {sectionLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="link-underline text-[var(--fg)] hover:text-[var(--accent)] transition-colors"
            >
              {link.label}
            </button>
          ))}
          <Link
            href="/inspiracion"
            className="link-underline text-[var(--fg)] hover:text-[var(--accent)] transition-colors"
          >
            Inspiración
          </Link>
        </div>

        <div className="hidden md:block font-mono text-[10px] tracking-[0.28em] uppercase text-[var(--fg-muted)]">
          CDMX · 2026
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center"
          aria-label="Menú"
        >
          <div className="space-y-[5px]">
            <motion.div className="w-5 h-px bg-current" animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : 0 }} />
            <motion.div className="w-5 h-px bg-current" animate={{ opacity: isOpen ? 0 : 1 }} />
            <motion.div className="w-5 h-px bg-current" animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 0 }} />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6 text-lg font-mono tracking-[0.2em] uppercase">
              {sectionLinks.map((link) => (
                <button key={link.id} onClick={() => scrollTo(link.id)} className="text-left py-2 text-[var(--fg)]">
                  {link.label}
                </button>
              ))}
              <Link href="/inspiracion" className="py-2 text-[var(--fg)]" onClick={() => setIsOpen(false)}>
                Inspiración
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
