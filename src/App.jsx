import React, { useState } from 'react'
import { Hero } from './components/Hero'
import { Loader } from './components/Loader'
import { PremiumCursor } from './components/PremiumCursor'
import { Nav, Footer, Band, Stats, BlobBG, Roster, Booking, Background3D, EasterEggs, Tweaks } from './components/index'
import { BookingProvider } from './contexts/BookingContext'
import { useTheme } from './contexts/ThemeContext'
import { COLECTIVOS, MARCAS } from './constants'
import './styles/main.css'

/**
 * Main App Component
 */
function App() {
  const [loaded, setLoaded] = useState(false)
  const theme = useTheme()

  return (
    <>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      {loaded && (
        <BookingProvider>
          <div className="layer layer-bg">
            <div className={`grain ${!theme.grainVisible ? 'hidden' : ''}`} />
            <div className="vignette" />
            <BlobBG showStars={theme.starsVisible} />
            <Background3D showStars={false} />
          </div>

          <div className="layer layer-ui content">
            <Nav />
            <Hero />
            <Band items={COLECTIVOS} label="Colectivos" />
            <Stats />
            <Roster />
            <Band items={MARCAS} reverse label="Marcas" />
            <Booking />
            <Footer />
          </div>

          <div className="layer layer-interaction">
            <PremiumCursor />
            <EasterEggs />
            <Tweaks />
          </div>
        </BookingProvider>
      )}
    </>
  )
}

export default App
