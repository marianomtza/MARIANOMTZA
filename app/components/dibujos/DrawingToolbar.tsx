'use client'

import React from 'react'
import { CanvasDrawingReturn, TOOLS } from '../../hooks/useCanvasDrawing'
import { DRAWING_SWATCHES } from '../../lib/drawings'

interface DrawingToolbarProps {
  drawing: CanvasDrawingReturn
  onClear: () => void
  onExport: () => void
}

export function DrawingToolbar({ drawing, onClear, onExport }: DrawingToolbarProps) {
  return (
    <section className="surface p-4 space-y-4">
      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--fg-muted)] mb-2">Herramienta</p>
        <div className="grid grid-cols-2 gap-2">
          {TOOLS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={drawing.tool === item.id}
              onClick={() => drawing.setTool(item.id)}
              className={`btn min-h-11 !px-3 !py-2 ${drawing.tool === item.id ? 'btn-primary' : 'btn-ghost'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--fg-muted)] mb-2">Color</p>
        <div className="grid grid-cols-3 gap-2">
          {DRAWING_SWATCHES.map((swatch) => (
            <button
              key={swatch.hex}
              type="button"
              aria-label={swatch.label}
              aria-pressed={drawing.color.toLowerCase() === swatch.hex.toLowerCase()}
              onClick={() => drawing.setColor(swatch.hex)}
              className="min-h-11 rounded-xl border text-[10px] font-mono"
              style={{
                background: swatch.hex,
                borderColor: drawing.color.toLowerCase() === swatch.hex.toLowerCase() ? 'var(--accent)' : 'var(--line)',
                color: swatch.hex === '#F8F5F0' ? '#111111' : '#ffffff',
              }}
            >
              ●
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--fg-muted)] mb-2 block">Tamaño</label>
        <input
          type="range"
          min={2}
          max={20}
          value={drawing.brushSize}
          onChange={(e) => drawing.setBrushSize(Number(e.target.value))}
          className="w-full"
          aria-label="Tamaño"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="btn btn-ghost min-h-11" onClick={drawing.undo} disabled={!drawing.canUndo}>Deshacer</button>
        <button type="button" className="btn btn-ghost min-h-11" onClick={drawing.redo} disabled={!drawing.canRedo}>Rehacer</button>
        <button type="button" className="btn btn-ghost min-h-11" onClick={onClear}>Limpiar</button>
        <button type="button" className="btn btn-ghost min-h-11" onClick={onExport}>Exportar PNG</button>
      </div>
    </section>
  )
}
