'use client'

import React from 'react'
import { BookingProvider } from './contexts/BookingContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { SoundProvider } from './contexts/SoundContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { RotatingBar, RotatingEntry } from './components/RotatingBar'
import { Roster } from './components/Roster'
import { Eventos } from './components/Eventos'
import { Booking } from './components/Booking'
import { Footer } from './components/Footer'
import { DrawingSection } from './components/dibujos/DrawingSection'
import { ThemeSwitcher } from './components/system/ThemeSwitcher'
import { SoundToggle } from './components/system/SoundToggle'
import { MusicDock } from './components/MusicDock'
import { EasterEgg } from './components/system/EasterEgg'

const PROJECTS: RotatingEntry[] = [
  { label: 'SEKS', href: 'https://www.instagram.com/seks.gratis/' },
  { label: 'LUDBOY', href: 'https://www.ludboy.com/' },
  { label: 'KNOCKOUT', href: 'https://www.instagram.com/knockout.fm/' },
  { label: 'LA FAMA', href: 'https://www.instagram.com/es.lafama/' },
]

const BRANDS: RotatingEntry[] = [
  { label: 'Spotify' },
  { label: 'Hennessy' },
  { label: 'Bacardí' },
  { label: 'Zacapa' },
  { label: 'Four Loko' },
  { label: 'Zyn' },
  { label: 'Hypnotiq' },
  { label: 'Mezcal Verde' },
  { label: 'Viuda de Romero' },
]

function LandingExperience() {
  return (
    <div className="relative bg-[var(--bg)] text-[var(--fg)] overflow-x-clip">
      <Navbar />
      <Hero />
      <RotatingBar entries={PROJECTS} direction="left" speed={82} ariaLabel="Proyectos destacados" variant="projects" />
      <Roster />
      <RotatingBar entries={BRANDS} direction="right" speed={64} ariaLabel="Marcas con las que ha colaborado" variant="brands" />
      <Eventos />
      <Booking />
      <DrawingSection />
      <Footer />

      <div className="fixed left-4 bottom-4 z-[70] flex items-center gap-2">
        <SoundToggle />
        <ThemeSwitcher />
      </div>

      <MusicDock />
      <EasterEgg />
    </div>
  )
}

export default function Page() {
  return (
    <ThemeProvider>
      <SoundProvider>
        <BookingProvider>
          <ErrorBoundary>
            <LandingExperience />
          </ErrorBoundary>
        </BookingProvider>
      </SoundProvider>
    </ThemeProvider>
  )
}
