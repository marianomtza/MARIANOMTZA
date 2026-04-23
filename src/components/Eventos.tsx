import React from 'react'
import { motion } from 'framer-motion'

interface Event {
  id: number
  title: string
  date: string
  venue: string
  link: string
  type: string
}

const EVENTS: Event[] = [
  {
    id: 1,
    title: "Cercle Odyssey CDMX",
    date: "2024",
    venue: "CDMX",
    link: "https://www.youtube.com/watch?v=UzPRso975PM",
    type: "Festival"
  },
  {
    id: 2,
    title: "Knockout: Lago Algo w/ Vegyn",
    date: "2024",
    venue: "Lago Algo, CDMX",
    link: "https://www.instagram.com/p/DNMhSKwx-uP/",
    type: "Club Night"
  },
  {
    id: 3,
    title: "MUTEK MX x Club Furia x Lapi",
    date: "2024",
    venue: "CDMX",
    link: "https://mexico.mutek.org/es/eventos/2024/colaboracion-especial-con-club-furia-x-lapi",
    type: "Festival"
  },
  {
    id: 4,
    title: "Keep Hush CDMX",
    date: "2024",
    venue: "CDMX",
    link: "https://www.youtube.com/playlist?list=PLhON8BygM1nIeGSsda4c5IvGvAbHyMysv",
    type: "Club Series"
  },
  {
    id: 5,
    title: "Algo Bien Pride 2024",
    date: "2024",
    venue: "CDMX",
    link: "https://www.youtube.com/watch?v=8GasfuDe4Dg",
    type: "Pride Event"
  },
  {
    id: 6,
    title: "Noches de Club Selectas",
    date: "2025",
    venue: "Varios, CDMX",
    link: "#",
    type: "Residency"
  }
]

export const Eventos: React.FC = () => {
  return (
    <section id="eventos" className="section py-24 border-t border-white/10 bg-black">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="max-w-[620px] mb-16">
          <div className="font-mono text-xs tracking-[0.24em] text-[#9b5fd6] mb-4">NOCHES QUE QUEDAN</div>
          <h2 className="text-balance text-[56px] leading-none tracking-[-1.6px] font-semibold mb-6">
            Eventos.<br />Memorias.<br />Legado.
          </h2>
          <p className="text-[#8a7fa0] text-[15px] max-w-[36ch]">
            Algunas de las noches que hemos construido juntos en Ciudad de México y más allá.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 p-px rounded-3xl overflow-hidden">
          {EVENTS.map((event, index) => (
            <motion.a
              key={event.id}
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-zinc-950 p-10 border border-white/10 hover:border-[#9b5fd6]/60 transition-all duration-500"
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between mb-8">
                <div className="font-mono text-[10px] tracking-[3px] text-[#9b5fd6]">{event.type}</div>
                <div className="text-xs text-white/40 group-hover:text-[#9b5fd6] transition">↗</div>
              </div>

              <h3 className="text-4xl font-semibold tracking-tight text-white leading-none mb-6 pr-8">
                {event.title}
              </h3>

              <div className="flex items-center gap-4 text-sm text-[#8a7fa0]">
                <span>{event.date}</span>
                <span className="w-px h-3 bg-white/20" />
                <span>{event.venue}</span>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="text-center mt-12 text-xs tracking-widest text-white/40 font-mono">
          MÁS EVENTOS EN NUESTRO ARCHIVO • 2023 — 2026
        </div>
      </div>
    </section>
  )
}
