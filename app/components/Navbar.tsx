import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const scrollTo = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setIsOpen(false)
  }

  const navLinks = [
    { label: 'Eventos', id: 'eventos' },
    { label: 'Artistas', id: 'artistas' },
    { label: 'Contacto', id: 'contacto' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/95 backdrop-blur-xl border-b border-[var(--line)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-mono tracking-[3px] text-[var(--accent)] text-sm hover:opacity-80 transition"
        >
          marianomtza
        </button>

        <div className="hidden md:flex items-center gap-10 text-sm tracking-[1px] font-mono">
          {navLinks.map((link) => (
            <button key={link.id} onClick={() => scrollTo(link.id)} className="hover:text-[var(--accent)] transition-colors">
              {link.label}
            </button>
          ))}
          <Link href="/inspiracion" className="hover:text-[var(--accent)]">Inspiración</Link>
        </div>

        <div className="hidden md:block text-xs tracking-[1px] font-mono text-[var(--fg-muted)]">Ciudad de México</div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden w-10 h-10 flex items-center justify-center" aria-label="Menú">
          <div className="space-y-1.5">
            <motion.div className="w-5 h-px bg-current" animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : 0 }} />
            <motion.div className="w-5 h-px bg-current" animate={{ opacity: isOpen ? 0 : 1 }} />
            <motion.div className="w-5 h-px bg-current" animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 0 }} />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-[var(--line)] bg-[var(--bg)]/95">
            <div className="px-6 py-8 flex flex-col gap-6 text-lg font-mono tracking-widest">
              {navLinks.map((link) => (
                <button key={link.id} onClick={() => scrollTo(link.id)} className="text-left hover:text-[var(--accent)] transition py-2">
                  {link.label}
                </button>
              ))}
              <Link href="/inspiracion" className="py-2" onClick={() => setIsOpen(false)}>Inspiración</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
