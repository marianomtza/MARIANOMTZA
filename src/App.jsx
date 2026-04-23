import React from 'react'
import { BookingProvider } from './contexts/BookingContext'
import { Hero } from './components'
import { Roster } from './components'
import { Booking } from './components'

function App() {
  return (
    <BookingProvider>
      <div className="bg-black text-white overflow-hidden">
        {/* Simple Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
            <div className="font-mono text-sm tracking-[3px] text-[#9b5fd6]">MARIANO MTZA</div>
            <div className="flex items-center gap-8 text-xs tracking-[1.5px] font-mono">
              <a href="#roster" className="hover:text-[#9b5fd6] transition">ROSTER</a>
              <a href="#booking" className="hover:text-[#9b5fd6] transition">BOOKING</a>
              <a href="https://instagram.com/marianomtza" target="_blank" className="hover:text-[#9b5fd6] transition">INSTAGRAM</a>
            </div>
          </div>
        </nav>

        <Hero />
        <Roster />
        <Booking />

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
