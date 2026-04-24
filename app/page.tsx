'use client'

import React from 'react'
import Lenis from '@studio-freight/lenis'
import { BookingProvider } from './contexts/BookingContext'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { RotatingBar } from './components/RotatingBar'
import { Roster } from './components/Roster'
import { Eventos } from './components/Eventos'
import { Booking } from './components/Booking'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppleMusicDock } from './components/AppleMusicDock'

export default function Page() {
  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem('mm_theme') || 'nocturne'
    document.documentElement.setAttribute('data-theme', storedTheme)

    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.4,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  return (
    <BookingProvider>
      <ErrorBoundary>
        <div className="overflow-hidden bg-[color:var(--bg)] text-[color:var(--fg)]">
          <Navbar />
          <Hero />
          <RotatingBar />
          <Roster />
          <Eventos />
          <Booking />

          <footer id="contacto" className="border-t border-[color:var(--line)] py-20">
            <div className="mx-auto max-w-[1440px] px-6 text-center md:px-12">
              <div className="mb-4 text-xs tracking-[0.2em] text-[color:var(--fg-muted)]">CIUDAD DE MÉXICO • 2026</div>
              <div className="mb-4 text-2xl tracking-tight">Booking & partnerships</div>
              <a href="mailto:hola@marianomtza.com" className="block text-sm text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]">hola@marianomtza.com</a>
              <a href="tel:+524434264931" className="mt-1 block text-sm text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]">+52 443 426 4931</a>
            </div>
          </footer>

          <AppleMusicDock />
        </div>
      </ErrorBoundary>
    </BookingProvider>
  )
}
