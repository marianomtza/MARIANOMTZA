import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Lenis from '@studio-freight/lenis'
import { BookingProvider } from './contexts/BookingContext'
import { Hero } from './components'
import { Roster } from './components'
import { Booking } from './components'
import { DrawingCanvas } from './components'

function App() {
  const [showDrawing, setShowDrawing] = useState(false)
  const [drawings, setDrawings] = useState([])

  // Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.0010000000000001 * Math.pow(2, -10 * t) * (Math.sin((t * 3.14 - 0.5) * 2) + 1) * 0.5 + 0.5),
      smoothWheel: true,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  const handleSaveDrawing = (drawingData) => {
    setDrawings(prev => [drawingData, ...prev].slice(0, 12))
    // In real app: POST to /api/drawings
    console.log('Drawing saved:', drawingData)
  }

  return (
    <BookingProvider>
      <div className="bg-black text-white overflow-hidden">
        {/* NAV - Spanish + Theme + Sound */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between text-sm">
            <div className="font-mono tracking-[3px] text-[#9b5fd6]">Mariano Martínez</div>

            <div className="hidden md:flex items-center gap-8 text-xs tracking-[2px] font-mono">
              <a href="#eventos" className="hover:text-[#9b5fd6] transition">Eventos</a>
              <a href="#roster" className="hover:text-[#9b5fd6] transition">Roster</a>
              <a href="#booking" className="hover:text-[#9b5fd6] transition">Reserva</a>
              <a href="#contacto" className="hover:text-[#9b5fd6] transition">Contacto</a>
            </div>

            <div className="flex items-center gap-4">
              <select 
                onChange={(e) => {
                  document.documentElement.setAttribute('data-theme', e.target.value)
                  localStorage.setItem('theme', e.target.value)
                }}
                className="bg-black border border-white/20 text-xs px-2 py-1 rounded font-mono"
                defaultValue="dark"
              >
                <option value="dark">Dark</option>
                <option value="pink">Pink</option>
                <option value="blue">Blue</option>
                <option value="neon">Neon</option>
              </select>

              <button 
                onClick={() => {
                  const isOn = document.body.classList.toggle('sound-on')
                  console.log('Sound:', isOn ? 'ON' : 'OFF')
                }}
                className="text-xs px-3 py-1 border border-white/20 rounded hover:bg-white hover:text-black transition"
              >
                🔊 Sound
              </button>
            </div>
          </div>
        </nav>

        <Hero />
        <Roster />

        {/* DÉJAME UN DIBUJO SECTION */}
        <section id="draw" className="section py-24 border-t border-white/10 bg-black/60 relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-5">
                <div className="font-mono text-xs tracking-[0.24em] text-[#9b5fd6] mb-4">SIGNATURE MOMENT</div>
                <h2 className="text-[56px] leading-none tracking-[-1.8px] font-semibold mb-6">Déjame<br />un dibujo.</h2>
                <p className="text-[#8a7fa0] max-w-[32ch] text-[15px]">
                  Instead of a review, leave a mark. A living wall of drawings from the community.
                </p>
                <button 
                  onClick={() => setShowDrawing(true)}
                  className="mt-8 group flex items-center gap-3 px-8 py-4 border border-white/30 text-xs tracking-[2px] rounded-full hover:bg-white hover:text-black transition-all"
                >
                  OPEN SKETCHBOOK
                  <span className="group-hover:rotate-45 transition">✍️</span>
                </button>
              </div>

              <div className="md:col-span-7">
                <div className="text-[10px] tracking-widest text-white/40 font-mono mb-4">THE LIVING WALL • {drawings.length} DRAWINGS</div>
                <div className="relative h-[420px] bg-zinc-950 rounded-3xl overflow-hidden border border-white/10">
                  {drawings.length > 0 ? (
                    drawings.slice(0, 6).map((d, i) => (
                      <motion.div
                        key={i}
                        className="absolute cursor-pointer"
                        style={{
                          left: `${15 + (i % 3) * 28}%`,
                          top: `${20 + Math.floor(i / 3) * 35}%`,
                          transform: `rotate(${i % 2 === 0 ? -4 : 3}deg)`,
                        }}
                        whileHover={{ scale: 1.04, rotate: 0 }}
                        onClick={() => setShowDrawing(true)}
                      >
                        <img src={d.preview} alt="drawing" className="w-40 rounded-xl border border-white/20 shadow-xl" />
                      </motion.div>
                    ))
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm tracking-widest font-mono">
                      BE THE FIRST TO LEAVE A MARK
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Booking />

        <AnimatePresence>
          {showDrawing && (
            <DrawingCanvas 
              onSave={handleSaveDrawing} 
              onClose={() => setShowDrawing(false)} 
            />
          )}
        </AnimatePresence>

        {/* Simple Footer */}
        <footer className="border-t border-white/10 py-16 bg-black">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
            <div className="font-mono text-xs tracking-[3px] text-white/50 mb-4">CIUDAD DE MÉXICO • 2026</div>
            <div className="text-sm text-white/60 max-w-md mx-auto">
              Curating unforgettable nights and sonic experiences across Mexico City and beyond.
            </div>
            <div className="mt-8 text-[10px] tracking-widest text-white/40 font-mono">
              © MARIANO MTZA. ALL RIGHTS RESERVED. • BUILT WITH FRAMER MOTION + TONE.JS
            </div>
          </div>
        </footer>
      </div>
    </BookingProvider>
  )
}

export default App
