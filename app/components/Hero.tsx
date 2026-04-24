'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion'
import { usePianoDock } from '../hooks/usePianoDock'
import { HeroBackground } from './hero/HeroBackground'

const TITLE = 'MARIANOMTZA'
const TITLE_LOWER = TITLE.toLowerCase()

const ROLES = [
  'Productor de Eventos',
  'Muevo Gente',
  'Manager',
  'Conecto Puntos',
  'A&R',
  'Documento Todo',
  'Director Creativo',
]

interface LetterProps {
  char: string
  index: number
  mouseX: MotionValue<number>
  isActive: MotionValue<number>
  containerRef: React.RefObject<HTMLDivElement | null>
}

const FALLOFF = 140
const COLOR_FALLOFF = 70

const Letter: React.FC<LetterProps> = ({ char, index, mouseX, isActive, containerRef }) => {
  const letterRef = useRef<HTMLSpanElement>(null)

  const rawScale = useTransform<number, number>([mouseX, isActive], (values) => {
    const [x, active] = values as [number, number]
    if (active === 0) return 1
    const el = letterRef.current
    const container = containerRef.current
    if (!el || !container) return 1
    const elRect = el.getBoundingClientRect()
    const contRect = container.getBoundingClientRect()
    const center = elRect.left + elRect.width / 2 - contRect.left
    const distance = Math.abs(x - center)
    const t = 1 - Math.min(distance, FALLOFF) / FALLOFF
    return 1 + t * active * 0.35
  })

  const rawY = useTransform<number, number>([mouseX, isActive], (values) => {
    const [x, active] = values as [number, number]
    if (active === 0) return 0
    const el = letterRef.current
    const container = containerRef.current
    if (!el || !container) return 0
    const elRect = el.getBoundingClientRect()
    const contRect = container.getBoundingClientRect()
    const center = elRect.left + elRect.width / 2 - contRect.left
    const distance = Math.abs(x - center)
    const t = 1 - Math.min(distance, FALLOFF) / FALLOFF
    return -t * active * 16
  })

  const colorT = useTransform<number, number>([mouseX, isActive], (values) => {
    const [x, active] = values as [number, number]
    if (active === 0) return 0
    const el = letterRef.current
    const container = containerRef.current
    if (!el || !container) return 0
    const elRect = el.getBoundingClientRect()
    const contRect = container.getBoundingClientRect()
    const center = elRect.left + elRect.width / 2 - contRect.left
    const distance = Math.abs(x - center)
    return 1 - Math.min(distance, COLOR_FALLOFF) / COLOR_FALLOFF
  })

  const color = useTransform(colorT, [0, 1], ['var(--fg)', 'var(--accent)'])

  const scale = useSpring(rawScale, { stiffness: 320, damping: 24, mass: 0.55 })
  const y = useSpring(rawY, { stiffness: 320, damping: 24, mass: 0.55 })

  return (
    <motion.span
      ref={letterRef}
      data-letter={index}
      tabIndex={0}
      className="inline-block select-none will-change-transform focus:outline-none focus:text-[var(--accent)]"
      style={{ scale, y, color, display: 'inline-block' }}
    >
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  )
}

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(-9999)
  const isActive = useMotionValue(0)
  const activeLetterRef = useRef<number>(-1)
  const [roleIndex, setRoleIndex] = useState(0)

  const { playNote, primeOnInteraction } = usePianoDock()

  useEffect(() => {
    const id = window.setInterval(() => {
      setRoleIndex((i) => (i + 1) % ROLES.length)
    }, 2600)
    return () => window.clearInterval(id)
  }, [])

  const reset = useCallback(() => {
    isActive.set(0)
    mouseX.set(-9999)
    activeLetterRef.current = -1
  }, [isActive, mouseX])

  useEffect(() => {
    const onBlur = () => reset()
    const onVisibility = () => {
      if (document.hidden) reset()
    }
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reset])

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      mouseX.set(x)
      isActive.set(1)

      const letters = container.querySelectorAll<HTMLElement>('[data-letter]')
      let closestIdx = -1
      let closestDist = Infinity
      letters.forEach((letter) => {
        const lRect = letter.getBoundingClientRect()
        const center = lRect.left + lRect.width / 2 - rect.left
        const dist = Math.abs(x - center)
        if (dist < lRect.width * 0.6 && dist < closestDist) {
          closestDist = dist
          closestIdx = Number(letter.dataset.letter)
        }
      })

      if (closestIdx !== -1 && closestIdx !== activeLetterRef.current) {
        activeLetterRef.current = closestIdx
        void playNote(closestIdx)
      }
      if (closestIdx === -1) {
        activeLetterRef.current = -1
      }
    },
    [mouseX, isActive, playNote]
  )

  const handleLeave = useCallback(() => {
    reset()
  }, [reset])

  const handleEnter = useCallback(() => {
    void primeOnInteraction()
  }, [primeOnInteraction])

  const handleFocusNote = useCallback((idx: number) => {
    void primeOnInteraction()
    void playNote(idx, 0.5)
  }, [playNote, primeOnInteraction])

  const handleCTA = (target: 'reserva' | 'eventos' | 'artistas') => {
    const el = document.getElementById(target)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-28 pb-24 overflow-hidden">
      <HeroBackground />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 w-full">
        {/* Eyebrow */}
        <div className="flex items-center gap-4 text-[11px] tracking-[0.32em] text-[var(--fg-muted)] mb-10 font-mono uppercase">
          <div className="w-8 h-px bg-[var(--accent)]" />
          Ciudad de México · Roster curado · 2026
        </div>

        {/* Interactive Title */}
        <div
          ref={containerRef}
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
          onPointerEnter={handleEnter}

          onKeyDown={(e) => {
            const idx = TITLE_LOWER.indexOf((e.key || '').toLowerCase())
            if (idx >= 0) handleFocusNote(idx)
          }}
          className="fluid-title font-display font-normal no-break-title text-[var(--fg)] mb-8 touch-none cursor-cell"
          style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}
          role="text"
          aria-label={TITLE_LOWER}
          onPointerDown={handleEnter}
        >
          {TITLE.split('').map((char, i) => (
            <Letter
              key={`${char}-${i}`}
              char={char}
              index={i}
              mouseX={mouseX}
              isActive={isActive}
              containerRef={containerRef}
            />
          ))}
        </div>

        {/* Rotating Role */}
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 mb-10 min-h-[3.25rem]">
          <div className="font-mono text-[11px] tracking-[0.28em] text-[var(--fg-muted)] uppercase">
            → CDMX
          </div>
          <motion.div
            key={roleIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="font-editorial text-[28px] md:text-[40px] text-[var(--fg)]"
          >
            {ROLES[roleIndex]}
          </motion.div>
        </div>

        {/* Proposal */}
        <p className="max-w-[40ch] text-[var(--fg-muted)] text-[15px] leading-relaxed mb-10">
          Produzco noches de más de cuatro mil asistentes. Booking, dirección creativa y logística
          para la escena nocturna y cultura joven de México.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => handleCTA('artistas')} className="btn btn-primary">
            <span>Ver roster</span>
            <span aria-hidden>↗</span>
          </button>
          <button onClick={() => handleCTA('reserva')} className="btn btn-ghost">
            <span>Reservar</span>
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
