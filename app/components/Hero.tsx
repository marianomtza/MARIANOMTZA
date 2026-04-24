import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { usePianoDock } from '../hooks/usePianoDock'

const TITLE = 'MARIANOMTZA'
const ROLES = ['Artist Roster Direction', 'Booking & Strategy', 'Creative Production', 'Cultural Partnerships']

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const Letter = ({
  char,
  index,
  cursorX,
  active,
  onHover,
}: {
  char: string
  index: number
  cursorX: MotionValue<number>
  active: MotionValue<number>
  onHover: (index: number) => void
}) => {
  const centerX = useMotionValue(-999)
  const distance = useTransform([cursorX, centerX, active], ([mouse, center, isActive]: number[]) => {
    if (!isActive) return 240
    return Math.abs(mouse - center)
  })

  const mappedScale = useTransform(distance, (d) => {
    const ratio = 1 - clamp(d / 180, 0, 1)
    return 1 + ratio * 0.34
  })

  const mappedY = useTransform(distance, (d) => {
    const ratio = 1 - clamp(d / 180, 0, 1)
    return -ratio * 8
  })

  const tint = useTransform(distance, [0, 180], ['var(--fg)', 'var(--fg-muted)'])
  const scale = useSpring(mappedScale, { stiffness: 310, damping: 32, mass: 0.45 })
  const y = useSpring(mappedY, { stiffness: 310, damping: 32, mass: 0.45 })

  return (
    <motion.span
      ref={(node) => {
        if (!node) return
        const rect = node.getBoundingClientRect()
        centerX.set(rect.left + rect.width / 2)
      }}
      style={{ scale, y, color: tint }}
      className="inline-block select-none will-change-transform"
      onMouseEnter={() => onHover(index)}
    >
      {char}
    </motion.span>
  )
}

export const Hero: React.FC = () => {
  const [roleIndex, setRoleIndex] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const cursorX = useMotionValue(-999)
  const active = useMotionValue(0)
  const parallaxX = useSpring(useTransform(cursorX, (v) => (v === -999 ? 0 : (v - 720) * 0.015)), {
    stiffness: 130,
    damping: 22,
  })

  const { playNote } = usePianoDock()

  useEffect(() => {
    setIsClient(true)
    const stored = window.localStorage.getItem('mm_sound_enabled')
    setSoundEnabled(stored === '1')
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length)
    }, 2600)

    const onBlur = () => {
      active.set(0)
      cursorX.set(-999)
    }

    window.addEventListener('blur', onBlur)
    return () => {
      clearInterval(interval)
      window.removeEventListener('blur', onBlur)
    }
  }, [active, cursorX])

  const letters = useMemo(() => TITLE.split(''), [])

  const handleMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    cursorX.set(event.clientX)
    active.set(1)
  }

  const handleExit = () => {
    active.set(0)
    cursorX.set(-999)
  }

  const handleSoundToggle = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    window.localStorage.setItem('mm_sound_enabled', next ? '1' : '0')
  }

  return (
    <section className="hero-shell section relative min-h-[90vh] overflow-hidden border-b border-[color:var(--line)] pt-24 pb-16">
      <motion.div className="pointer-events-none absolute inset-0 opacity-60" style={{ x: parallaxX }}>
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_15%,rgba(163,154,142,0.16),transparent_70%)]" />
      </motion.div>
      <div className="noise-layer" />

      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-8 px-6 md:px-12">
        <div className="text-[11px] tracking-[0.22em] text-[color:var(--fg-muted)]">CIUDAD DE MÉXICO · MANAGEMENT</div>

        <div
          ref={containerRef}
          className="select-none text-[min(16vw,200px)] font-semibold leading-[0.88] tracking-[-0.035em] text-[color:var(--fg)]"
          onPointerMove={handleMove}
          onPointerLeave={handleExit}
        >
          {letters.map((char, index) => (
            <Letter key={`${char}-${index}`} char={char} index={index} cursorX={cursorX} active={active} onHover={(i) => playNote(i, 0.62, soundEnabled)} />
          ))}
        </div>

        <motion.p
          key={roleIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[36ch] text-[clamp(1.2rem,2.2vw,2.4rem)] tracking-[-0.01em] text-[color:var(--fg)]"
        >
          {ROLES[roleIndex]}
        </motion.p>

        <p className="max-w-[44ch] text-[15px] leading-relaxed text-[color:var(--fg-muted)]">
          Plataforma editorial para roster, booking y alianzas culturales. Precisión operativa con identidad interactiva.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth' })} className="btn btn-primary btn-shine">
            Booking
          </button>
          <button onClick={() => document.getElementById('artistas')?.scrollIntoView({ behavior: 'smooth' })} className="btn btn-ghost btn-shine">
            Ver roster
          </button>
          <button onClick={handleSoundToggle} className="ml-1 rounded-full border border-[color:var(--line)] px-4 py-2 text-[11px] tracking-[0.16em] text-[color:var(--fg-muted)] transition hover:text-[color:var(--fg)]">
            SOUND {isClient && soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </section>
  )
}
