import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import * as Tone from 'tone'

const TITLE = 'MARIANOMTZA'

const ROLES = [
  'Productor de Eventos',
  'Muevo Gente',
  'Manager',
  'Conecto Puntos',
  'A&R',
  'Documento todo',
  'Director Creativo',
]

const NOTE_FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46]

let synth: Tone.Synth | null = null
let isAudioInitialized = false
let lastPlay = 0
const DEBOUNCE = 70

const initAudio = async () => {
  if (isAudioInitialized) return
  try {
    await Tone.start()
    synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.008, decay: 0.18, sustain: 0.12, release: 0.35 }
    }).toDestination()
    isAudioInitialized = true
  } catch (e) {
    console.warn('Audio no disponible')
  }
}

const playNote = (index: number, velocity = 0.65) => {
  const now = Date.now()
  if (now - lastPlay < DEBOUNCE) return
  lastPlay = now
  
  if (!synth) return
  
  const freq = NOTE_FREQUENCIES[index % NOTE_FREQUENCIES.length]
  synth.triggerAttackRelease(freq, '8n', undefined, velocity)
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
  const [hovered, setHovered] = useState(false)

  const distance = useTransform(mouseX, (x: number) => {
    if (!letterRef.current || !containerRef.current) return 0
    const rect = letterRef.current.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()
    const center = rect.left + rect.width / 2 - containerRect.left
    return Math.abs(x - center)
  })

  const scale = useTransform(distance, [0, 110], [1.55, 1])
  const yOffset = useTransform(distance, [0, 110], [-10, 0])
  const colorVal = useTransform(distance, [0, 70], ['#9b5fd6', '#f4f1f7'])

  const springScale = useSpring(scale, { stiffness: 320, damping: 22 })
  const springY = useSpring(yOffset, { stiffness: 320, damping: 22 })

  const handleEnter = useCallback(() => {
    setHovered(true)
    onMagnify(index)
    playNote(index)
  }, [index, onMagnify])

  const handleLeave = useCallback(() => {
    setHovered(false)
  }, [])

  return (
    <motion.span
      ref={letterRef}
      className="char inline-block cursor-none select-none"
      style={{
        scale: springScale,
        y: springY,
        color: hovered ? '#9b5fd6' : colorVal,
        textShadow: hovered ? '0 0 18px rgba(155, 95, 214, 0.5)' : 'none',
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.55, y: -10 }}
    >
      {char}
    </motion.span>
  )
}

export const Hero: React.FC = () => {
  const [roleIndex, setRoleIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)

  // Role rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length)
    }, 2600)
    return () => clearInterval(interval)
  }, [])

  // Mouse tracking
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left)
      }
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [mouseX])

  const handleMagnify = useCallback((_idx: number) => {
    initAudio()
  }, [])

  const handleCTA = (target: 'reserva' | 'eventos') => {
    initAudio()
    playNote(0, 0.75)
    const el = document.getElementById(target)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="relative min-h-[94vh] flex flex-col justify-between pt-20 pb-16 overflow-hidden bg-black">
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 pt-12">
        {/* Eyebrow */}
        <div className="flex items-center gap-4 text-xs tracking-[0.28em] text-[#8a7fa0] mb-10 font-mono">
          <div className="w-px h-3 bg-[#9b5fd6]" />
          CIUDAD DE MÉXICO
        </div>

        {/* Interactive Title - Musical Dock */}
        <div 
          ref={containerRef}
          className="relative flex flex-wrap gap-x-[1px] text-[min(16.5vw,210px)] font-black tracking-[-0.032em] leading-[0.88] text-white mb-9"
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
        <div className="flex items-center gap-5 mb-11">
          <div className="text-sm tracking-[0.18em] text-white flex items-center gap-3 font-mono">
            → <span className="text-[#9b5fd6]">CDMX</span>
          </div>
          <motion.div 
            key={roleIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[27px] md:text-[42px] font-semibold tracking-[-0.015em] text-white"
          >
            {ROLES[roleIndex]}
          </motion.div>
        </div>

        {/* Proposal */}
        <p className="max-w-[38ch] text-[#8a7fa0] text-[15px] leading-relaxed mb-14">
          Produzco noches de más de 4000 asistentes. Booking, logística y dirección creativa para la escena nocturna y cultura joven de México.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <motion.button
            onClick={() => handleCTA('reserva')}
            className="btn btn-primary group"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
          >
            Booking
            <span className="group-hover:translate-x-0.5 transition">↗</span>
          </motion.button>

          <motion.button
            onClick={() => handleCTA('eventos')}
            className="btn btn-ghost group"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
          >
            Eventos
            <span className="group-hover:translate-x-0.5 transition">↗</span>
          </motion.button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] tracking-[0.28em] text-[#8a7fa0] font-mono"
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 2.1, repeat: Infinity }}
      >
        DESPLAZA PARA EXPLORAR
        <div className="w-px h-7 bg-gradient-to-b from-transparent via-[#9b5fd6] to-transparent" />
      </motion.div>
    </section>
  )
}