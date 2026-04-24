import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { usePianoDock } from '../hooks/usePianoDock'

const TITLE = 'MARIANOMTZA'
const MARQUEE_ITEMS = [
  'SEKS',
  'LUDBOY',
  'KNOCKOUT',
  'LA FAMA',
  'SPOTIFY',
  'HENNESSY',
  'BACARDÍ',
  'ZACAPA',
  'FOUR LOKO',
  'ZYN',
  'HYPNOTIQ',
  'MEZCAL VERDE',
  'VIUDA DE ROMERO',
]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const HeroLetter: React.FC<{
  char: string
  index: number
  cursorX: ReturnType<typeof useMotionValue<number>>
  active: ReturnType<typeof useMotionValue<number>>
}> = ({ char, index, cursorX, active }) => {
  const centerX = useMotionValue(-9999)

  const distance = useTransform([cursorX, centerX], (values) => {
    const [pointer, center] = values as number[]
    return Math.abs(pointer - center)
  })

  const dockScale = useTransform(distance, (d) => {
    const factor = 1 - clamp(d, 0, 200) / 200
    return 1 + factor * 0.32
  })

  const activeScale = useTransform(active, (activeIndex) => (activeIndex === index ? 1.04 : 1))
  const scale = useTransform([dockScale, activeScale], (values) => {
    const [dock, focused] = values as number[]
    return dock * focused
  })

  const y = useTransform(distance, (d) => {
    const factor = 1 - clamp(d, 0, 180) / 180
    return -6 * factor
  })

  const springScale = useSpring(scale, { stiffness: 460, damping: 34, mass: 0.23 })
  const springY = useSpring(y, { stiffness: 430, damping: 36, mass: 0.24 })

  return (
    <motion.span
      ref={(el) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        centerX.set(rect.left + rect.width / 2)
      }}
      className="char inline-block select-none"
      style={{ scale: springScale, y: springY }}
    >
      {char}
    </motion.span>
  )
}

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const cursorX = useMotionValue(-9999)
  const activeIndex = useMotionValue(-1)
  const { playNote, enabled, toggleSound } = usePianoDock()
  const lastFrameRef = useRef(0)

  const letters = useMemo(() => TITLE.split(''), [])
  const marquee = useMemo(() => [...MARQUEE_ITEMS, ...MARQUEE_ITEMS], [])

  const resetDock = useCallback(() => {
    cursorX.set(-9999)
    activeIndex.set(-1)
  }, [activeIndex, cursorX])

  useEffect(() => {
    const handleBlur = () => resetDock()
    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [resetDock])

  const setFromPointer = useCallback((clientX: number) => {
    const now = performance.now()
    if (now - lastFrameRef.current < 16) return
    lastFrameRef.current = now

    cursorX.set(clientX)

    const nodes = containerRef.current?.querySelectorAll('[data-letter]')
    if (!nodes?.length) return

    let closest = -1
    let closestDistance = Number.POSITIVE_INFINITY

    nodes.forEach((node, index) => {
      const rect = (node as HTMLElement).getBoundingClientRect()
      const distance = Math.abs(clientX - (rect.left + rect.width / 2))
      if (distance < closestDistance) {
        closestDistance = distance
        closest = index
      }
    })

    if (closest !== activeIndex.get()) {
      activeIndex.set(closest)
      if (closest > -1) playNote(closest)
    }
  }, [activeIndex, cursorX, playNote])

  const handleCTA = useCallback((target: 'reserva' | 'eventos') => {
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <section className="relative min-h-[96vh] overflow-hidden border-b border-[var(--line)] pt-24 pb-14">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_15%_12%,rgba(187,167,145,0.12)_0%,rgba(17,17,18,0)_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_65%_at_85%_0%,rgba(107,96,120,0.15)_0%,rgba(17,17,18,0)_70%)]" />
        <div className="noise-layer absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-16 px-6 md:px-12">
        <div className="flex items-center justify-between text-[11px] tracking-[0.28em] text-[var(--fg-dim)]">
          <span>CIUDAD DE MÉXICO</span>
          <button onClick={toggleSound} className="rounded-full border border-[var(--line)] px-4 py-1.5 text-[10px] tracking-[0.18em]">
            SOUND {enabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div
          ref={containerRef}
          onPointerMove={(e) => setFromPointer(e.clientX)}
          onPointerLeave={resetDock}
          className="flex flex-wrap gap-x-[2px] text-[min(16vw,218px)] font-black leading-[0.84] tracking-[-0.03em] text-[var(--fg)]"
        >
          {letters.map((char, i) => (
            <span key={`${char}-${i}`} data-letter>
              <HeroLetter char={char} index={i} cursorX={cursorX} active={activeIndex} />
            </span>
          ))}
        </div>

        <p className="max-w-[52ch] text-base leading-relaxed text-[var(--fg-dim)]">
          Curaduría, booking y dirección creativa para artistas y marcas. El roster es el foco; cada interfaz está diseñada para convertir en segundos.
        </p>

        <div className="flex flex-wrap gap-4">
          <button onClick={() => handleCTA('reserva')} className="btn btn-primary">Booking</button>
          <button onClick={() => handleCTA('eventos')} className="btn btn-ghost">Eventos</button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] py-3">
          <motion.div
            drag="x"
            dragMomentum={false}
            dragElastic={0.04}
            dragConstraints={{ left: -520, right: 0 }}
            style={{ touchAction: 'pan-y' }}
            className="flex min-w-max items-center gap-5 px-5 text-xs tracking-[0.24em] text-[var(--fg-dim)]"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 24 }}
          >
            {marquee.map((item, i) => (
              <React.Fragment key={`${item}-${i}`}>
                <span>{item}</span>
                <span className="h-1 w-1 rounded-full bg-[var(--fg-dim)]/60" />
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
