'use client'

import React from 'react'
import { CanvasDrawingReturn, COLORS, TOOLS } from '../../hooks/useCanvasDrawing'

interface DrawingCanvasProps {
  drawing: CanvasDrawingReturn
  brushSize: number
  setBrushSize: (value: number) => void
  saveDrawing: () => Promise<void>
  saving: boolean
  hasDrawing: boolean
  error: string
  name: string
  setName: (value: string) => void
  message: string
  setMessage: (value: string) => void
}

export function DrawingCanvas({
  drawing,
  brushSize,
  setBrushSize,
  saveDrawing,
  saving,
  hasDrawing,
  error,
  name,
  setName,
  message,
  setMessage,
}: DrawingCanvasProps) {
  const {
    canvasRef,
    start,
    draw,
    stop,
    clear,
    exportImage,
    undo,
    color,
    setColor,
    currentTool,
    setCurrentTool,
  } = drawing

  return (
    <div className="grid lg:grid-cols-12 gap-8 mb-12">
      <div className="lg:col-span-8 rounded-2xl border border-[var(--line)] bg-[#f8f5f0] p-3">
        <canvas
          ref={canvasRef}
          className="w-full h-[360px] md:h-[460px] rounded-xl touch-none"
          onPointerDown={start}
          onPointerMove={draw}
          onPointerUp={stop}
          onPointerCancel={stop}
          onPointerLeave={stop}
        />
      </div>

      <aside className="lg:col-span-4 space-y-5">
        <div className="surface p-4 space-y-4">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--fg-muted)]">Herramientas</p>
          <div className="grid grid-cols-4 gap-2">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setCurrentTool(tool.id)}
                className={`btn ${currentTool === tool.id ? 'btn-primary' : 'btn-ghost'} !px-2 !py-2 min-h-11`}
                aria-label={tool.label}
                type="button"
              >
                {tool.icon}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--fg-muted)]">Tamaño</label>
            <input
              type="range"
              min={1}
              max={24}
              step={1}
              value={brushSize}
              onChange={(event) => setBrushSize(Number(event.target.value))}
              className="w-full"
              aria-label="Tamaño de brocha"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {COLORS.map((swatch) => (
              <button
                key={swatch}
                onClick={() => setColor(swatch)}
                className="min-h-11 rounded-full border"
                style={{ background: swatch, borderColor: color === swatch ? 'var(--accent)' : 'var(--line)' }}
                aria-label={`Color ${swatch}`}
                type="button"
              />
            ))}
          </div>
          <button type="button" onClick={undo} className="btn btn-ghost min-h-11 w-full">Deshacer</button>
          <button type="button" onClick={clear} className="btn btn-ghost min-h-11 w-full">Limpiar</button>
        </div>

        <div className="surface p-4 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="form-input" maxLength={80} placeholder="Nombre" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="form-input min-h-[80px]" maxLength={220} placeholder="Mensaje breve" />
          <button type="button" onClick={() => void saveDrawing()} disabled={saving || !hasDrawing} className="btn btn-primary min-h-11 w-full disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? 'Guardando…' : 'Guardar en museo'}
          </button>
          <a href={exportImage() || '#'} download="mmtza-dibujo.png" className="btn btn-ghost min-h-11 w-full pointer-events-auto">Exportar PNG</a>
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      </aside>
    </div>
  )
}
