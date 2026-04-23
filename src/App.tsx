import React from 'react'
import { BookingProvider } from './contexts/BookingContext'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Roster } from './components/Roster'
import { Eventos } from './components/Eventos'
import { Inspiracion } from './components/Inspiracion'
import { Booking } from './components/Booking'
import { ErrorBoundary } from './components/ErrorBoundary'
import Lenis from '@studio-freight/lenis'

function App() {
  // Lenis smooth scroll
  React.useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
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
        <div className="bg-black text-white overflow-hidden">
          <Navbar />
          <Hero />
          <Eventos />
          <Roster />
          <Inspiracion />
          <Booking />

          {/* Footer */}
          <footer id="contacto" className="border-t border-white/10 py-20 bg-black">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
              <div className="font-mono text-xs tracking-[3px] text-white/50 mb-5">CIUDAD DE MÉXICO • 2026</div>
              
              <div className="text-2xl font-semibold tracking-tight mb-4">¿Listo para la próxima noche?</div>
              <a 
                href="mailto:hola@marianomtza.com" 
                className="text-[#9b5fd6] hover:underline text-lg tracking-wide"
              >
                hola@marianomtza.com
              </a>

              <div className="mt-16 text-[10px] tracking-widest text-white/40 font-mono">
                © MARIANO MTZA. TODOS LOS DERECHOS RESERVADOS.<br />
                CONSTRUIDO CON FRAMER MOTION + TONE.JS + LENIS
              </div>
            </div>
          </footer>
        </div>
      </ErrorBoundary>
    </BookingProvider>
  )
}

export default App