'use client'

import React from 'react'
import { BookingProvider } from './contexts/BookingContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { SoundProvider } from './contexts/SoundContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { RotatingBar } from './components/RotatingBar'
import { Roster } from './components/Roster'
import { Eventos } from './components/Eventos'
import { Dibujos } from './components/Dibujos'
import { Booking } from './components/Booking'
import { Footer } from './components/Footer'
import { ThemeSwitcher } from './components/system/ThemeSwitcher'
import { SoundToggle } from './components/system/SoundToggle'
import { MusicDock } from './components/MusicDock'

const ROTATING_BAR_ONE = [
  { label: 'SEKS', href: 'https://www.instagram.com/seks.gratis/' },
  { label: 'LUDBOY', href: 'https://www.ludboy.com/' },
  { label: 'KNOCKOUT', href: 'https://www.instagram.com/knockout.fm/' },
  { label: 'LA FAMA', href: 'https://www.instagram.com/es.lafama/' },
]

const ROTATING_BAR_TWO = [
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
      <RotatingBar entries={ROTATING_BAR_ONE} />
      <Eventos />
      <Roster />
      <RotatingBar entries={ROTATING_BAR_TWO} />
      <Booking />
      <Dibujos />
      <Footer />

      {/* Floating controls */}
      <div className="fixed left-4 bottom-4 z-[70] flex items-center gap-2">
        <SoundToggle />
        <ThemeSwitcher />
      </div>

      <MusicDock />
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
