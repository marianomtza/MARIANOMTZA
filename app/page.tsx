'use client'

import React from 'react'
import Lenis from '@studio-freight/lenis'
import { BookingProvider } from './contexts/BookingContext'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Roster } from './components/Roster'
import { Eventos } from './components/Eventos'
import { Dibujos } from './components/Dibujos'
import { Booking } from './components/Booking'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Inspiracion } from './components/Inspiracion'

export default function Page() {
  React.useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.18,
      smoothWheel: true,
      wheelMultiplier: 1.4,
      touchMultiplier: 1.8,
    })

    let frameId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    }
    frameId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frameId)
      lenis.destroy()
    }
  }, [])

  return (
    <BookingProvider>
      <ErrorBoundary>
        <div className="bg-black text-white overflow-hidden">
          <Navbar />
          <Hero />
          <Eventos />
          <Dibujos />
          <Roster />
          <Booking />
          <Inspiracion />

          {/* Footer */}
          <footer id="contacto" className="border-t border-white/10 py-20 bg-black">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
              <div className="font-mono text-xs tracking-[3px] text-white/50 mb-5">CIUDAD DE MÉXICO • 2026</div>

              <div className="text-2xl font-semibold tracking-tight mb-4">¿Listo para la próxima noche?</div>
              <a
                href="mailto:mariano1302mariano1302@gmail.com"
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                mariano1302mariano1302@gmail.com
              </a>
            </div>
          </footer>
        </div>
      </ErrorBoundary>
    </BookingProvider>
  )
}
