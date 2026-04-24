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
import { Booking } from './components/Booking'
import { Footer } from './components/Footer'
import { ThemeSwitcher } from './components/system/ThemeSwitcher'
import { SoundToggle } from './components/system/SoundToggle'
import { MusicDock } from './components/MusicDock'

function LandingExperience() {
  return (
    <div className="relative bg-[var(--bg)] text-[var(--fg)] overflow-x-clip">
      <Navbar />
      <Hero />
      <RotatingBar />
      <Roster />
      <Eventos />
      <Booking />
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
