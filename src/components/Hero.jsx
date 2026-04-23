import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import * as Tone from 'tone'

const TITLE = 'MARIANOMTZA'
const ROLES = [
  { role: 'Productor', tag: 'Música Electrónica' },
  { role: 'Booking', tag: 'Eventos & Festivales' },
  { role: 'A&R', tag: 'Descubrimiento de Talento' },
  { role: 'Director Creativo', tag: 'Experiencias Inmersivas' },
]

const NOTE_FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46]

let audioContext: Tone.Synth | null = null
let isInitialized = false
let lastPlayTime = 0
const DEBOUNCE_MS = 80

const initAudio = async () => {
  if (isInitialized) return
  try {
    await Tone.start()
    audioContext = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.4 }
    }).toDestination()
    isInitialized = true
  } catch (e) {
    console.warn('Audio init failed', e)
  }
}

const playNote = (index: number, velocity = 0.7) => {
  const now = Date.now()
  if (now - lastPlayTime < DEBOUNCE_MS) return
  lastPlayTime = now
  
  if (!audioContext) return
  
  const freq = NOTE_FREQUENCIES[index % NOTE_FREQUENCIES.length]
  audioContext.triggerAttackRelease(freq, '8n', undefined, velocity)
}

interface LetterProps {
  char: string
  index: number
  mouseX: any
  containerRef: React.RefObject<HTMLDivElement>
  onMagnify: (idx: number) => void
}

const Letter: React.FC<LetterProps> = ({ char, index, mouseX, containerRef, onMagnify }) => {
  const letterRef = useRef<HTMLSpanElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const distance = useTransform(mouseX, (x: number) => {
    if (!letterRef.current || !containerRef.current) return 0
    const rect = letterRef.current.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()
    const letterCenter = rect.left + rect.width / 2 - containerRect.left
    return Math.abs(x - letterCenter)
  })

  const scale = useTransform(distance, [0, 120], [1.6, 1])
  const y = useTransform(distance, [0, 120], [-12, 0])
  const color = useTransform(distance, [0, 80], ['#9b5fd6', '#f4f1f7'])

  const springScale = useSpring(scale, { stiffness: 300, damping: 25 })
  const springY = useSpring(y, { stiffness: 300, damping: 25 })

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    onMagnify(index)
    playNote(index)
  }, [index, onMagnify])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  return (
    <motion.span
      ref={letterRef}
      className="char inline-block cursor-none select-none"
      style={{
        scale: springScale,
        y: springY,
        color: isHovered ? '#9b5fd6' : color,
        textShadow: isHovered ? '0 0 20px rgba(155, 95, 214, 0.6)' : 'none',
        transition: 'color 0.1s ease',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.6, y: -12 }}
    >
      {char}
    </motion.span>
  )
}

export const Hero: React.FC = () => {
  const [currentRole, setCurrentRole] = useState(0)
  const [magnifiedIndex, setMagnifiedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Rotating roles
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % ROLES.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  // Mouse tracking for dock effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left)
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX])

  const handleMagnify = useCallback((idx: number) => {
    setMagnifiedIndex(idx)
    initAudio()
  }, [])

  const handleCTAClick = (type: 'booking' | 'events') => {
    initAudio()
    playNote(0, 0.8)
    if (type === 'booking') {
      const bookingSection = document.getElementById('booking')
      bookingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      const eventsSection = document.getElementById('events')
      eventsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="hero relative min-h-[92vh] flex flex-col justify-between pt-20 pb-12 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#1a0a2e_0.8px,transparent_1px)] bg-[length:4px_4px] opacity-40" />
      
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Eyebrow */}
        <div className="hero-eyebrow mb-8 flex items-center gap-3 text-xs tracking-[0.3em] text-[#8a7fa0] uppercase">
          <span className="inline-block w-px h-3 bg-[#9b5fd6]" /> CIUDAD DE MÉXICO
        </div>

        {/* Interactive Title with Dock Effect */}
        <div 
          ref={containerRef}
          className="hero-title relative flex flex-wrap gap-x-[2px] text-[min(17vw,220px)] font-black tracking-[-0.035em] leading-[0.92] text-white mb-8"
          onMouseLeave={() => setMagnifiedIndex(-1)}
        >
          {TITLE.split('').map((char, i) => (
            <Letter
              key={i}
              char={char}
              index={i}
              mouseX={mouseX}
              containerRef={containerRef}
              onMagnify={handleMagnify}
            />
          ))}
        </div>

        {/* Rotating Role */}
        <div className="flex items-center gap-4 mb-10">
          <div className="hero-role text-sm tracking-[0.2em] text-white flex items-center gap-3">
            → <span className="font-mono text-[#9b5fd6]">{ROLES[currentRole].tag}</span>
          </div>
          <motion.div 
            key={currentRole}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-4xl font-semibold tracking-tight text-white"
          >
            {ROLES[currentRole].role}
          </motion.div>
        </div>

        {/* Description */}
        <p className="max-w-[42ch] text-[#8a7fa0] text-[15px] leading-relaxed mb-12">
          Productor y curador de experiencias sonoras. <strong className="text-white font-medium">+4000 asistentes</strong> en las noches más intensas de la ciudad.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <motion.button
            onClick={() => handleCTAClick('booking')}
            className="btn primary group flex items-center gap-3 px-9 py-4 rounded-full bg-[#9b5fd6] text-white text-xs tracking-[0.22em] uppercase font-mono hover:bg-[#b67de8] transition-all active:scale-[0.985]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.985 }}
          >
            RESERVAR FECHA
            <span className="group-hover:translate-x-0.5 transition">↗</span>
          </motion.button>

          <motion.button
            onClick={() => handleCTAClick('events')}
            className="btn ghost flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 text-xs tracking-[0.22em] uppercase font-mono hover:border-[#9b5fd6] hover:text-[#9b5fd6] transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.985 }}
          >
            VER EVENTOS
          </motion.button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] tracking-[0.3em] text-[#8a7fa0] font-mono"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      >
        SCROLL TO EXPLORE
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#9b5fd6] to-transparent" />
      </motion.div>
    </section>
  )
}

export default Hero
