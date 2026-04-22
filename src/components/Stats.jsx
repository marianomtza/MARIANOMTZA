import React, { useRef, useState, useEffect, useCallback } from 'react'

export function Stats() {
  const R = 44
  const C = 2 * Math.PI * R

  const ITEMS = [
    { n: 7, suffix: '+', label: 'años produciendo eventos', sub: 'desde 2017', p: 0.78 },
    { n: 55, suffix: '+', label: 'eventos el último año', sub: 'festivales · clubes · conciertos', p: 0.92 },
    { n: 2000, suffix: '', label: 'cap. promedio por noche', sub: 'asistentes', p: 0.6 },
    { n: 10, suffix: '+', label: 'artistas en roster', sub: 'colectivo LA FAMA', p: 0.85 },
  ]

  const cardRefs = useRef([])
  const [counts, setCounts] = useState(ITEMS.map(() => 0))
  const [rings, setRings] = useState(ITEMS.map(() => 0))
  const [visible, setVisible] = useState(ITEMS.map(() => false))
  const [tilts, setTilts] = useState(ITEMS.map(() => ({ rx: 0, ry: 0, gx: 50, gy: 50 })))

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
            setRings((r) => {
              const nr = [...r]
              nr[i] = e * item.p
              return nr
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
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilts((t) => {
      const nt = [...t]
      nt[i] = { rx: y * -14, ry: x * 14, gx: 50 + x * 50, gy: 50 + y * 50 }
      return nt
    })
  }, [])

  const onLeave = useCallback((i) => {
    setTilts((t) => {
      const nt = [...t]
      nt[i] = { rx: 0, ry: 0, gx: 50, gy: 50 }
      return nt
    })
  }, [])

  return (
    <section className="section stats-section" id="stats">
      <div className="wrap">
        <div className="stats3d-grid">
          {ITEMS.map((it, i) => {
            const { rx, ry, gx, gy } = tilts[i]
            const resting = rx === 0 && ry === 0
            
            // eslint-disable-next-line no-unused-vars
            const dashoffset = C * (1 - rings[i]) // Used if SVG circle is implemented
            
            return (
              <div
                key={i}
                ref={(el) => (cardRefs.current[i] = el)}
                className={'stats3d-outer' + (visible[i] ? ' in' : '')}
                style={{ perspective: '700px', transitionDelay: `${i * 90}ms` }}
                onMouseMove={(e) => onMove(e, i)}
                onMouseLeave={() => onLeave(i)}
              >
                <div
                  className="stats3d-card"
                  style={{
                    transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
                    transition: resting
                      ? 'transform .7s cubic-bezier(0.22,1,0.36,1), box-shadow .4s'
                      : 'transform .08s linear',
                  }}
                >
                  <div
                    className="stats3d-glow"
                    style={{ opacity: resting ? 0 : 0.16 }}
                  />
                  <div
                    className="stats3d-shine"
                    style={{
                      background: `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.08) 0%, transparent 62%)`,
                    }}
                  />

                  <div className="stats3d-ring-wrap">
                    <div className="stats3d-n">
                      {counts[i].toLocaleString()}
                      {it.suffix}
                    </div>
                  </div>

                  <div className="stats3d-label">{it.label}</div>
                  {it.sub && <div className="stats3d-sub">{it.sub}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
