import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const QUOTES = [
  {
    text: "Cada evento se diseña para que la música, el espacio y la gente conecten de forma natural.",
    author: "Visión de proyecto",
    role: "Producción"
  },
  {
    text: "La curaduría sonora se construye con contexto, intención y respeto por la audiencia.",
    author: "Visión de proyecto",
    role: "Curaduría"
  },
  {
    text: "Una experiencia bien producida cuida cada detalle: técnica, narrativa y hospitalidad.",
    author: "Visión de proyecto",
    role: "Dirección creativa"
  },
  {
    text: "El objetivo final es simple: crear noches memorables, seguras y coherentes de principio a fin.",
    author: "Visión de proyecto",
    role: "Operación"
  }
]

export const Inspiracion: React.FC = () => {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((prev) => (prev + 1) % QUOTES.length)
  const prev = () => setCurrent((prev) => (prev - 1 + QUOTES.length) % QUOTES.length)

  return (
    <section id="inspiracion" className="section py-24 border-t border-white/10 bg-black">
      <div className="max-w-[1120px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <div className="font-mono text-xs tracking-[0.24em] text-[#9b5fd6] mb-4">PENSAMIENTO SONORO</div>
          <h2 className="text-[56px] leading-none tracking-[-1.6px] font-semibold">Inspiración</h2>
        </div>

        <div className="relative max-w-4xl mx-auto h-[420px] flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="text-center px-8"
            >
              <div className="text-[42px] md:text-[56px] leading-[1.1] tracking-[-1.2px] font-semibold text-white max-w-[28ch] mx-auto">
                “{QUOTES[current].text}”
              </div>
              <div className="mt-12 text-[#8a7fa0]">
                {QUOTES[current].author} <span className="text-white/40">— {QUOTES[current].role}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-4 mt-12">
          <button 
            onClick={prev}
            className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:border-[#9b5fd6] hover:text-[#9b5fd6] transition"
            aria-label="Anterior"
          >
            ←
          </button>
          <button 
            onClick={next}
            className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:border-[#9b5fd6] hover:text-[#9b5fd6] transition"
            aria-label="Siguiente"
          >
            →
          </button>
        </div>

        <div className="text-center mt-8 text-[10px] tracking-[2px] text-white/40 font-mono">
          DESLIZA O USA LAS FLECHAS • {current + 1} / {QUOTES.length}
        </div>
      </div>
    </section>
  )
}
