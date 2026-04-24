'use client'

import React from 'react'
import { BookingProvider } from './contexts/BookingContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { SoundProvider } from './contexts/SoundContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { RotatingBar, type BarEntry } from './components/RotatingBar'
import { Eventos } from './components/Eventos'
import { Roster } from './components/Roster'
import { Booking } from './components/Booking'
import { Dibujos } from './components/Dibujos'
import { Footer } from './components/Footer'
import { ThemeSwitcher } from './components/system/ThemeSwitcher'
import { SoundToggle } from './components/system/SoundToggle'
import { MusicDock } from './components/MusicDock'

// ── Rotating bar 1 — Projects (with links) ────────────────────────────────────
const PROJECTS: BarEntry[] = [
  { label: 'SEKS',    type: 'project', url: 'https://www.instagram.com/seks.gratis/' },
  { label: 'LUDBOY',  type: 'project', url: 'https://www.ludboy.com/' },
  { label: 'KNOCKOUT',type: 'project', url: 'https://www.instagram.com/knockout.fm/' },
  { label: 'LA FAMA', type: 'project', url: 'https://www.instagram.com/es.lafama/' },
]

// ── Rotating bar 2 — Brands ───────────────────────────────────────────────────
const BRANDS: BarEntry[] = [
  { label: 'Spotify',        type: 'brand' },
  { label: 'Hennessy',       type: 'brand' },
  { label: 'Bacardí',        type: 'brand' },
  { label: 'Zacapa',         type: 'brand' },
  { label: 'Four Loko',      type: 'brand' },
  { label: 'Zyn',            type: 'brand' },
  { label: 'Hypnotiq',       type: 'brand' },
  { label: 'Mezcal Verde',   type: 'brand' },
  { label: 'Viuda de Romero',type: 'brand' },
]

// ── Page layout ───────────────────────────────────────────────────────────────
// Order: Hero → Bar1(projects) → Noches memorables → Roster →
//        Bar2(brands) → Booking → Dibujos → Footer

function LandingExperience() {
  return (
    <div className="relative bg-[var(--bg)] text-[var(--fg)] overflow-x-clip">
      <Navbar />

      {/* 1 — Hero (3D background + interactive title) */}
      <Hero />

      {/* 2 — Rotating bar: projects */}
      <RotatingBar entries={PROJECTS} />

      {/* 3 — Noches memorables (event archive) */}
      <Eventos />

      {/* 4 — Roster */}
      <Roster />

      {/* 5 — Rotating bar: brands */}
      <RotatingBar entries={BRANDS} />

      {/* 6 — Booking */}
      <Booking />

      {/* 7 — Dibujos */}
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
