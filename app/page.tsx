'use client'

import React from 'react'
import { BookingProvider } from './contexts/BookingContext'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Roster } from './components/Roster'
import { Eventos } from './components/Eventos'
import { Dibujos } from './components/Dibujos'
import { Booking } from './components/Booking'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'
import { ExperienceProvider } from './contexts/ExperienceContext'
import { ThemeSwitcher } from './components/system/ThemeSwitcher'
import { ParticleField } from './components/system/ParticleField'
import { DraggableStats } from './components/system/DraggableStats'
import { ExperienceController } from './components/system/ExperienceController'
import { useScrollEngine } from './hooks/useScrollEngine'

function LandingExperience() {
  useScrollEngine()

  return (
    <div className="bg-[var(--bg)] text-[var(--fg)] overflow-hidden">
      <ParticleField />
      <Navbar />
      <Hero />
      <Eventos />
      <Dibujos />
      <Roster />
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pb-20">
        <DraggableStats />
      </div>
      <Booking />

      <footer id="contacto" className="border-t border-[var(--line)] py-20 bg-[var(--bg)]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
          <div className="font-mono text-xs tracking-[3px] text-[var(--fg-muted)] mb-5">CIUDAD DE MÉXICO • 2026</div>
          <div className="text-2xl font-semibold tracking-tight mb-4">¿Listo para la próxima noche?</div>
          <a href="mailto:mariano1302mariano1302@gmail.com" className="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors text-sm">
            mariano1302mariano1302@gmail.com
          </a>
        </div>
      </footer>

      <ThemeSwitcher />
      <ExperienceController />
    </div>
  )
}

export default function Page() {
  return (
    <ThemeProvider>
      <ExperienceProvider>
        <BookingProvider>
          <ErrorBoundary>
            <LandingExperience />
          </ErrorBoundary>
        </BookingProvider>
      </ExperienceProvider>
    </ThemeProvider>
  )
}
