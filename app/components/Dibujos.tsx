'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useCanvasDrawing, TOOLS, COLORS } from '../hooks/useCanvasDrawing'

export function Dibujos() {
  const {
    canvasRef,
    start,
    draw,
    stop,
    clear,
    undo,
    exportImage,
    color,
    setColor,
    currentTool,
    setCurrentTool,
    strokeCount,
  } = useCanvasDrawing()

  const download = () => {
    const image = exportImage()
    if (!image) return
    const link = document.createElement('a')
    link.href = image
    link.download = `mmtza-dibujo-${Date.now()}.png`
    link.click()
  }

  return (
    <section className="rounded-3xl border border-[var(--line)] bg-[var(--bg-elevated)]/70 p-4 md:p-6 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-2xl md:text-3xl">Dibujos en vivo</h3>
          <p className="text-xs md:text-sm text-[var(--fg-muted)]">
            Presión sensible, pinceles editoriales y render fluido.
          </p>
        </div>
        <div className="text-[10px] tracking-[0.2em] uppercase text-[var(--fg-muted)] font-mono">
          Trazos: {strokeCount}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_auto] gap-4">
        <div className="relative rounded-2xl overflow-hidden border border-[var(--line)] bg-[#f8f5f0]">
          <canvas
            ref={canvasRef}
            onPointerDown={start}
            onPointerMove={draw}
            onPointerUp={stop}
            onPointerCancel={stop}
            onPointerLeave={stop}
            className="h-[440px] md:h-[520px] w-full touch-none"
          />
          <div className="absolute left-3 bottom-3 text-[10px] font-mono tracking-[0.2em] uppercase text-[#4a3f57]/80 pointer-events-none">
            dibuja con mouse, touch o stylus
          </div>
        </div>

        <div className="flex lg:flex-col gap-4 lg:w-[230px]">
          <div className="flex-1 rounded-2xl border border-[var(--line)] p-3 bg-[var(--bg)]/70">
            <div className="text-[10px] uppercase tracking-[0.2em] mb-2 text-[var(--fg-muted)] font-mono">
              Pinceles
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TOOLS.map((tool) => (
                <motion.button
                  key={tool.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setCurrentTool(tool.id)}
                  className={`rounded-lg border px-2 py-2 text-xs transition ${
                    currentTool === tool.id
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--fg)]'
                      : 'border-[var(--line)] hover:border-[var(--accent)]/50 text-[var(--fg-muted)]'
                  }`}
                >
                  <div className="font-mono text-[10px]">{tool.icon}</div>
                  <div className="mt-1">{tool.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex-1 rounded-2xl border border-[var(--line)] p-3 bg-[var(--bg)]/70">
            <div className="text-[10px] uppercase tracking-[0.2em] mb-2 text-[var(--fg-muted)] font-mono">
              Colores
            </div>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((swatch) => (
                <button
                  key={swatch}
                  onClick={() => setColor(swatch)}
                  className={`h-7 w-7 rounded-full border transition ${
                    color === swatch ? 'scale-110 border-[var(--fg)]' : 'border-[var(--line)]'
                  }`}
                  style={{ backgroundColor: swatch }}
                  aria-label={`Seleccionar color ${swatch}`}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--line)] p-3 bg-[var(--bg)]/70 space-y-2">
            <button onClick={undo} className="btn btn-ghost w-full justify-center">Deshacer</button>
            <button onClick={clear} className="btn btn-ghost w-full justify-center">Limpiar</button>
            <button onClick={download} className="btn btn-primary w-full justify-center">Exportar PNG</button>
          </div>
        </div>
      </div>
    </section>
  )
}
