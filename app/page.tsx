'use client'

import React from 'react'
import Lenis from '@studio-freight/lenis'
import { BookingProvider } from './contexts/BookingContext'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Roster } from './components/Roster'
import { Eventos } from './components/Eventos'
import { Booking } from './components/Booking'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppleMusicDock } from './components/AppleMusicDock'

export default function Page() {
  React.useEffect(() => {
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 1.1, touchMultiplier: 1.2 })

    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  return (
    <BookingProvider>
      <ErrorBoundary>
        <div className="site-shell overflow-hidden">
          <Navbar />
          <Hero />
          <Roster />
          <Eventos />
          <Booking />
          <AppleMusicDock />

          <footer id="contacto" className="border-t border-[var(--line)] py-20">
            <div className="mx-auto max-w-[1440px] px-6 text-center md:px-12">
              <div className="mb-5 font-mono text-xs tracking-[3px] text-[var(--fg-dim)]">CIUDAD DE MÉXICO • 2026</div>
              <div className="mb-4 text-2xl font-semibold tracking-tight">¿Listo para la próxima noche?</div>
              <a href="mailto:hola@marianomtza.com" className="text-sm text-[var(--fg-dim)] hover:text-[var(--fg)]">
                hola@marianomtza.com
              </a>
            </div>
          </footer>
        </div>
      </ErrorBoundary>
    </BookingProvider>
  )
}
