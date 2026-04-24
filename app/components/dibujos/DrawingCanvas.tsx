'use client'

import React from 'react'
import { CanvasDrawingReturn } from '../../hooks/useCanvasDrawing'

export function DrawingCanvas({ drawing }: { drawing: CanvasDrawingReturn }) {
  return (
    <div className="relative rounded-2xl border border-[var(--line)] bg-[#f8f5f0] p-3 shadow-[inset_0_1px_8px_rgba(0,0,0,0.08)]">
      <canvas
        ref={drawing.canvasRef}
        aria-label="Área para dibujar"
        className="w-full min-h-[320px] h-[360px] md:h-[520px] rounded-xl touch-none"
        style={{ touchAction: 'none' }}
        onPointerDown={drawing.onPointerDown}
        onPointerMove={drawing.onPointerMove}
        onPointerUp={drawing.onPointerUp}
        onPointerCancel={drawing.onPointerCancel}
      />
      <span className="pointer-events-none absolute bottom-6 right-6 text-[10px] tracking-[0.2em] font-mono uppercase text-black/40">
        MARIANOMTZA
      </span>
    </div>
  )
}
