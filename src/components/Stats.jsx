import React, { useRef, useState, useEffect, useCallback } from 'react'

export function Stats() {
  const ITEMS = [
    { n: 7, suffix: '+', label: 'años produciendo eventos', sub: 'desde 2017', p: 0.78 },
    { n: 55, suffix: '+', label: 'eventos el último año', sub: 'festivales · clubes · conciertos', p: 0.92 },
    { n: 2000, suffix: '', label: 'cap. promedio por noche', sub: 'asistentes', p: 0.6 },
    { n: 10, suffix: '+', label: 'artistas en roster', sub: 'colectivo LA FAMA', p: 0.85 },
  ]

  const cardRefs = useRef([])
  const [counts, setCounts] = useState(ITEMS.map(() => 0))
  const [visible, setVisible] = useState(ITEMS.map(() => false))

  useEffect(() => {
    let isMounted = true
    const observers = []
    const rafs = []

    ITEMS.forEach((item, i) => {
      const el = cardRefs.current[i]
      if (!el) return

      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          io.disconnect()

          if (!isMounted) return

          setVisible((v) => {
            const nv = [...v]
            nv[i] = true
            return nv
          })

          const dur = 1600 + i * 180
          const t0 = performance.now()

          const tick = (now) => {
            if (!isMounted) return
            const t = Math.min((now - t0) / dur, 1)
            const e = 1 - Math.pow(1 - t, 4)

            setCounts((c) => {
              const nc = [...c]
              nc[i] = Math.round(e * item.n)
              return nc
            })

            if (t < 1) {
              rafs[i] = requestAnimationFrame(tick)
            }
          }
          rafs[i] = requestAnimationFrame(tick)
        },
        { threshold: 0.2 }
      )

      io.observe(el)
      observers.push(io)
    })

    return () => {
      isMounted = false
      observers.forEach((io) => io.disconnect())
      rafs.forEach((raf) => {
        if (raf) cancelAnimationFrame(raf)
      })
    }
  }, [])

  const onMove = useCallback((e, i) => {
    if (window.matchMedia?.('(pointer: coarse)').matches) return
    const cardEl = cardRefs.current[i]
    if (!cardEl) return
    const rect = cardEl.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    cardEl.style.transform = `rotateX(${y * -14}deg) rotateY(${x * 14}deg)`
    cardEl.style.setProperty('--mx', `${50 + x * 50}%`)
    cardEl.style.setProperty('--my', `${50 + y * 50}%`)
  }, [])

  const onLeave = useCallback((i) => {
    const cardEl = cardRefs.current[i]
    if (!cardEl) return
    cardEl.style.transform = 'rotateX(0deg) rotateY(0deg)'
    cardEl.style.setProperty('--mx', '50%')
    cardEl.style.setProperty('--my', '50%')
  }, [])

  return (
    <section className="section stats-section" id="stats">
      <div className="wrap">
        <div className="stats-grid">
          {ITEMS.map((it, i) => (
            <article
              key={it.label}
              ref={(el) => (cardRefs.current[i] = el)}
              className={'stat-card' + (visible[i] ? ' in' : '')}
              style={{ transitionDelay: `${i * 90}ms` }}
              onMouseMove={(e) => onMove(e, i)}
              onMouseLeave={() => onLeave(i)}
            >
              <div className="stat-n">
                {counts[i].toLocaleString()}
                {it.suffix}
              </div>
              <div className="stat-label">{it.label}</div>
              {it.sub && <div className="stat-sub">{it.sub}</div>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
