import React, { useState } from 'react'
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
    { label: 'Roster', id: 'artistas' },
    { label: 'Inspiración', id: 'inspiracion' },
    { label: 'Contacto', id: 'contacto' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        {/* Logo - Left */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-mono tracking-[3px] text-[#9b5fd6] text-sm hover:opacity-80 transition"
        >
          Mariano Martínez
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10 text-sm tracking-[1px] font-mono">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="hover:text-[#9b5fd6] transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right - Ciudad de México */}
        <div className="hidden md:block text-xs tracking-[1px] font-mono text-[#8a7fa0]">
          Ciudad de México
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center"
          aria-label="Menú"
        >
          <div className="space-y-1.5">
            <motion.div 
              className="w-5 h-px bg-white" 
              animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : 0 }}
            />
            <motion.div 
              className="w-5 h-px bg-white" 
              animate={{ opacity: isOpen ? 0 : 1 }}
            />
            <motion.div 
              className="w-5 h-px bg-white" 
              animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 0 }}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-black/95"
          >
            <div className="px-6 py-8 flex flex-col gap-6 text-lg font-mono tracking-widest">
              {navLinks.map((link, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(link.id)}
                  className="text-left hover:text-[#9b5fd6] transition py-2"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-4 border-t border-white/10 text-xs text-white/50">
                CIUDAD DE MÉXICO • 2026
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}