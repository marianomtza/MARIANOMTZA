import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface Drawing {
  id: string
  image: string
  name: string
  message: string
  timestamp: string
  tool: string
}

interface Point {
  x: number
  y: number
}

interface Stroke {
  points: Point[]
  color: string
  size: number
  tool: 'pencil' | 'marker' | 'ink'
}

const TOOLS = [
  { id: 'pencil' as const, label: 'LÁPIZ', size: 2.2, icon: '✎' },
  { id: 'marker' as const, label: 'MARCADOR', size: 7.5, icon: '▬' },
  { id: 'ink' as const, label: 'TINTA', size: 4.8, icon: '≈' },
]

const COLORS = [
  '#111111', 
  '#9b5fd6', 
  '#c026d3', 
  '#5a3d7a'
]

export const Dibujos: React.FC = () => {
  const [mode, setMode] = useState<'dibujar' | 'galeria'>('dibujar')
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [selected, setSelected] = useState<Drawing | null>(null)
  const [currentTool, setCurrentTool] = useState<'pencil' | 'marker' | 'ink'>('pencil')
  const [currentColor, setCurrentColor] = useState('#111111')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [error, setError] = useState('')
  const [strokeCount, setStrokeCount] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Stroke[]>([])
  const isDrawingRef = useRef(false)
  const currentStrokeRef = useRef<Stroke | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load drawings from localStorage (persistent "archive")
  useEffect(() => {
    const saved = localStorage.getItem('marianomtza-drawings')
    if (saved) {
      try {
        setDrawings(JSON.parse(saved))
      } catch (e) {
        console.warn('Could not parse saved drawings')
      }
    }
  }, [])

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('marianomtza-drawings', JSON.stringify(drawings))
  }, [drawings])

  // High-DPI canvas setup + paper feel
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const dpr = Math.max(window.devicePixelRatio || 1, 1)
    
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })!
    ctx.scale(dpr, dpr)
    
    // Subtle paper grain (drawn once)
    ctx.fillStyle = '#f8f5f0'
    ctx.fillRect(0, 0, rect.width, rect.height)
    
    ctx.strokeStyle = 'rgba(17, 17, 17, 0.035)'
    ctx.lineWidth = 0.4
    for (let x = 8; x < rect.width; x += 11) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + (Math.random() - 0.5) * 0.8, rect.height)
      ctx.stroke()
    }
    
    redraw()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver(() => {
      setupCanvas()
    })
    
    resizeObserver.observe(canvas)
    
    // Initial setup
    setTimeout(setupCanvas, 50)

    return () => resizeObserver.disconnect()
  }, [setupCanvas])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const cssW = canvas.width / (window.devicePixelRatio || 1)
    const cssH = canvas.height / (window.devicePixelRatio || 1)

    // Reset paper
    ctx.fillStyle = '#f8f5f0'
    ctx.fillRect(0, 0, cssW, cssH)

    // Very subtle grain
    ctx.fillStyle = 'rgba(155, 95, 214, 0.012)'
    for (let i = 0; i < 280; i++) {
      const x = Math.random() * cssW
      const y = Math.random() * cssH
      ctx.fillRect(x, y, 1.2, 1.2)
    }

    // Subtle paper lines texture (moved here so it's always visible)
    ctx.strokeStyle = 'rgba(17, 17, 17, 0.035)'
    ctx.lineWidth = 0.4
    for (let x = 8; x < cssW; x += 11) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + (Math.random() - 0.5) * 0.8, cssH)
      ctx.stroke()
    }

    // Draw all strokes with organic imperfection
    strokesRef.current.forEach((stroke) => {
      if (stroke.points.length < 2) return

      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowColor = stroke.color
      ctx.shadowBlur = stroke.tool === 'ink' ? 6 : (stroke.tool === 'marker' ? 1.5 : 0)

      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

      for (let i = 1; i < stroke.points.length; i++) {
        const p = stroke.points[i]
        let x = p.x
        let y = p.y

        // Pencil texture: micro jitter (controlled chaos)
        if (stroke.tool === 'pencil' && i % 2 === 0) {
          x += (Math.random() - 0.5) * 0.9
          y += (Math.random() - 0.5) * 0.9
        }

        // Ink bleed simulation
        if (stroke.tool === 'ink' && i % 3 === 0) {
          ctx.save()
          ctx.globalAlpha = 0.12 + Math.random() * 0.08
          ctx.lineWidth = stroke.size * 1.65
          ctx.shadowBlur = 9
          const ox = (Math.random() - 0.5) * 1.8
          const oy = (Math.random() - 0.5) * 1.8
          ctx.lineTo(x + ox, y + oy)
          ctx.stroke()
          ctx.restore()
          
          ctx.globalAlpha = 1
          ctx.lineWidth = stroke.size
          ctx.shadowBlur = 6
        }

        // Smooth quadratic curves for natural flow
        if (i > 1) {
          const prev = stroke.points[i - 1]
          const midX = (prev.x + x) / 2
          const midY = (prev.y + y) / 2
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    })

    ctx.shadowBlur = 0
  }, [])

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const point = getPoint(e)
    const toolConfig = TOOLS.find(t => t.id === currentTool)!
    
    setIsDrawing(true)
    if (strokeCount === 0) setStrokeCount(1)
    currentStrokeRef.current = {
      points: [point],
      color: currentColor,
      size: toolConfig.size * (e.pressure || 0.65) * (currentTool === 'marker' ? 1.1 : 1),
      tool: currentTool,
    }

    const ctx = canvas.getContext('2d')!
    ctx.strokeStyle = currentColor
    ctx.lineWidth = currentStrokeRef.current.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = currentColor
    ctx.shadowBlur = currentTool === 'ink' ? 5 : 0

    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }

  const drawMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return

    const point = getPoint(e)
    const stroke = currentStrokeRef.current
    stroke.points.push(point)

    const ctx = canvasRef.current!.getContext('2d')!
    
    let drawX = point.x
    let drawY = point.y

    if (stroke.tool === 'pencil') {
      drawX += (Math.random() - 0.5) * 0.7
      drawY += (Math.random() - 0.5) * 0.7
    }

    ctx.lineTo(drawX, drawY)
    ctx.stroke()

    // Extra ink bleed on move
    if (stroke.tool === 'ink') {
      ctx.save()
      ctx.globalAlpha = 0.09
      ctx.lineWidth = stroke.size * 1.9
      ctx.shadowBlur = 10
      ctx.lineTo(
        drawX + (Math.random() - 0.5) * 2.2,
        drawY + (Math.random() - 0.5) * 2.2
      )
      ctx.stroke()
      ctx.restore()
      ctx.globalAlpha = 1
      ctx.lineWidth = stroke.size
      ctx.shadowBlur = 5
    }
  }

  const endDrawing = () => {
    if (!isDrawing || !currentStrokeRef.current) return
    setIsDrawing(false)
    
    // Only keep strokes with meaningful length
    if (currentStrokeRef.current.points.length > 3) {
      strokesRef.current.push(currentStrokeRef.current)
      setStrokeCount(c => c + 1)
    }
    currentStrokeRef.current = null
  }

  const undo = () => {
    strokesRef.current.pop()
    setStrokeCount(c => Math.max(0, c - 1))
    redraw()
  }

  const clearCanvas = () => {
    strokesRef.current = []
    setStrokeCount(0)
    setIsDrawing(false)
    redraw()
    setError('')
  }

  const handleSubmit = async () => {
    const canvas = canvasRef.current
    if (!canvas || strokeCount === 0) {
      setError('Dibuja algo primero. Un trazo cuenta más que mil palabras.')
      return
    }

    setError('')
    setStatus('loading')

    // Capture as high-quality PNG
    const imageData = canvas.toDataURL('image/png', 0.94)

    const newDrawing: Drawing = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      image: imageData,
      name: name.trim() || 'Anónimo',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      tool: currentTool,
    }

    // Add to archive (newest on top)
    setDrawings(prev => [newDrawing, ...prev])

    // Celebration — cinematic but restrained
    confetti({
      particleCount: 140,
      spread: 65,
      origin: { y: 0.58 },
      colors: ['#9b5fd6', '#111111', '#f4f1f7']
    })
    
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 65,
        spread: 55,
        origin: { x: 0.18, y: 0.72 }
      })
    }, 240)

    // Reset everything
    setTimeout(() => {
      strokesRef.current = []
      setStrokeCount(0)
      setIsDrawing(false)
      redraw()
      setName('')
      setMessage('')
      setStatus('success')
      
      setTimeout(() => {
        setStatus('idle')
        // Auto-switch to gallery to see the new piece
        setMode('galeria')
      }, 1650)
    }, 720)
  }

  // Gallery positions — organic, pinned-note layout (no rigid grid)
  const galleryPositions = useMemo(() => {
    return drawings.slice(0, 14).map((_, i) => {
      const col = i % 5
      const row = Math.floor(i / 5)
      const seed = i * 0.6180339887 // golden ratio for natural distribution
      return {
        x: 6 + col * 19 + (Math.sin(seed * 3) * 3.5),
        y: 8 + row * 34 + (Math.cos(seed * 2.3) * 4.2) + (row % 2 === 0 ? 3 : -2),
        rot: (i % 7 - 3.5) * 1.8 + Math.sin(seed) * 2.1,
        scale: 0.96 + (i % 4) * 0.015,
      }
    })
  }, [drawings])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).toUpperCase()
  }

  return (
    <section id="dibujos" className="section py-24 border-t border-white/10 bg-black">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-x-16">
          {/* LEFT — INTRO / STICKY */}
          <div className="md:col-span-5 mb-16 md:mb-0">
            <div className="sticky top-24">
              <div className="font-mono text-xs tracking-[0.24em] text-[#9b5fd6] mb-4">CUADERNO DE LA NOCHE</div>
              
              <h2 className="text-[64px] md:text-[72px] leading-[0.92] tracking-[-2.4px] font-semibold text-white mb-8">
                Déjame<br />un dibujo
              </h2>

              <div className="max-w-[36ch] text-[#8a7fa0] text-[15px] leading-relaxed mb-10">
                NO ACEPTO RESENAS NI OPINIONES, SOLO DIBUJITOS
              </div>

              <div className="flex items-center gap-4 text-xs font-mono tracking-[1.5px] text-white/40">
                <div className="w-px h-2.5 bg-[#9b5fd6]" /> 
                CADA TRAZO ES PÚBLICO
              </div>

            </div>
          </div>

          {/* RIGHT — INTERACTIVE CORE */}
          <div className="md:col-span-7">
            {/* MODE TOGGLE — like Booking */}
            <div className="flex mb-8 border-b border-white/10">
              {(['dibujar', 'galeria'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`
                    flex-1 pb-4 text-sm tracking-[1.5px] font-medium transition-all relative
                    ${mode === m ? 'text-white' : 'text-white/40 hover:text-white/70'}
                  `}
                >
                  {m === 'dibujar' ? 'DEJAR UN TRAZO' : 'VER EL ARCHIVO'}
                  {mode === m && (
                    <motion.div 
                      layoutId="dibujo-underline"
                      className="absolute bottom-0 left-0 h-px w-full bg-[#9b5fd6]" 
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {mode === 'dibujar' && (
                <motion.div
                  key="draw"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-8"
                >
                  {/* TOOLBAR — tactile, alive */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-zinc-950 rounded-2xl p-1 border border-white/10">
                      {TOOLS.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => setCurrentTool(tool.id)}
                          className={`
                            px-5 py-2.5 text-xs tracking-[1.2px] font-medium rounded-xl transition-all flex items-center gap-2
                            ${currentTool === tool.id 
                              ? 'bg-[#9b5fd6] text-white shadow-lg' 
                              : 'text-white/60 hover:text-white hover:bg-white/5'}
                          `}
                        >
                          <span className="text-base">{tool.icon}</span>
                          {tool.label}
                        </button>
                      ))}
                    </div>

                    {/* Color swatches — hand-picked palette */}
                    <div className="flex items-center gap-2 ml-1">
                      {COLORS.map((col, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentColor(col)}
                          className={`
                            w-7 h-7 rounded-full border transition-all
                            ${currentColor === col 
                              ? 'border-white scale-110 shadow-[0_0_0_3px_rgba(155,95,214,0.3)]' 
                              : 'border-white/20 hover:border-white/50'}
                          `}
                          style={{ backgroundColor: col }}
                          aria-label={`Color ${col}`}
                        />
                      ))}
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center gap-2 text-xs font-mono tracking-widest">
                      <button 
                        onClick={undo}
                        className="px-4 py-2 border border-white/20 hover:border-[#9b5fd6] hover:text-[#9b5fd6] rounded-full transition flex items-center gap-1.5"
                      >
                        ↩ DESHACER
                      </button>
                      <button 
                        onClick={clearCanvas}
                        className="px-4 py-2 border border-white/20 hover:border-red-400 hover:text-red-400 rounded-full transition"
                      >
                        LIMPIAR
                      </button>
                    </div>
                  </div>

                  {/* CANVAS — the heart. Paper. Imperfect. Tactile. */}
                  <div 
                    ref={containerRef}
                    className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#f8f5f0]"
                    style={{ height: '520px' }}
                  >
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 touch-none"
                      style={{ 
                        cursor: isDrawing ? 'none' : 'crosshair',
                        imageRendering: 'crisp-edges'
                      }}
                      onPointerDown={startDrawing}
                      onPointerMove={drawMove}
                      onPointerUp={endDrawing}
                      onPointerLeave={endDrawing}
                      onPointerCancel={endDrawing}
                    />
                    
                    {/* Subtle instruction overlay when empty */}
                    {strokeCount === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <div className="text-[#9b5fd6]/60 text-xs tracking-[3px] mb-3 font-mono">TOCA Y ARRASTRA</div>
                          <div className="text-white/40 text-sm">Tu trazo aquí</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Optional identity + message */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">TU NOMBRE (OPCIONAL)</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="form-input text-lg" 
                      />
                    </div>
                    <div>
                      <label className="form-label">UN MENSAJE CORTO (OPCIONAL)</label>
                      <input 
                        type="text" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="La noche se sintió como esto..."
                        className="form-input text-lg" 
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div></div>
                    
                    <motion.button
                      onClick={handleSubmit}
                      disabled={status === 'loading' || strokeCount === 0}
                      className="group flex items-center gap-4 px-10 py-4 bg-white text-black text-xs tracking-[2px] font-medium rounded-full disabled:opacity-60 hover:bg-[#9b5fd6] hover:text-white transition-all active:scale-[0.985]"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.985 }}
                    >
                      {status === 'loading' ? 'GUARDANDO EN EL ARCHIVO...' : 
                       status === 'success' ? 'TRAZO AÑADIDO ✓' : 'ENVIAR MI DIBUJO'}
                      <span className="group-hover:translate-x-1 transition">↗</span>
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-sm tracking-wide"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* GALLERY — floating, imperfect, alive */}
              {mode === 'galeria' && (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative"
                >
                  <div className="mb-8 flex items-end justify-between">
                    <div>
                      <div className="font-mono text-xs tracking-[0.24em] text-[#9b5fd6]">ARCHIVO VIVO • {drawings.length} TRAZOS</div>
                      <div className="text-white/60 text-sm mt-1">Pasa el cursor • Toca para ampliar</div>
                    </div>
                    {drawings.length > 0 && (
                      <button 
                        onClick={() => setMode('dibujar')}
                        className="text-xs tracking-widest border border-white/20 px-5 py-2 rounded-full hover:border-[#9b5fd6] hover:text-[#9b5fd6] transition"
                      >
                        + AÑADIR OTRO
                      </button>
                    )}
                  </div>

                  {drawings.length === 0 ? (
                    <div className="h-[420px] flex flex-col items-center justify-center border border-white/10 rounded-3xl bg-zinc-950/50">
                      <div className="text-6xl mb-6 opacity-40">✎</div>
                      <div className="text-xl text-white/70 mb-2">El cuaderno está vacío</div>
                      <div className="text-sm text-white/50 max-w-[260px] text-center">
                        Sé el primero en dejar tu trazo. Tu dibujo se convertirá en parte de la historia.
                      </div>
                      <button 
                        onClick={() => setMode('dibujar')}
                        className="mt-8 px-8 py-3 border border-[#9b5fd6] text-[#9b5fd6] text-xs tracking-[1.5px] rounded-full hover:bg-[#9b5fd6] hover:text-white transition"
                      >
                        EMPEZAR A DIBUJAR
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="relative h-[620px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/60"
                      onMouseMove={(e) => {
                        // Light parallax on the whole gallery (premium touch)
                        const rect = e.currentTarget.getBoundingClientRect()
                        const mx = (e.clientX - rect.left) / rect.width - 0.5
                        const my = (e.clientY - rect.top) / rect.height - 0.5
                        
                        const cards = e.currentTarget.querySelectorAll('.gallery-card')
                        cards.forEach((card, idx) => {
                          const factor = (idx % 3 + 1) * 0.6
                          ;(card as HTMLElement).style.transform = 
                            `translate(${mx * factor}px, ${my * factor}px)`
                        })
                      }}
                    >
                      {drawings.slice(0, 14).map((drawing, index) => {
                        const pos = galleryPositions[index]
                        if (!pos) return null
                        
                        return (
                          <motion.div
                            key={drawing.id}
                            className="gallery-card absolute cursor-pointer"
                            style={{
                              left: `${pos.x}%`,
                              top: `${pos.y}%`,
                              transform: `rotate(${pos.rot}deg)`,
                              zIndex: 10 + index,
                            }}
                            initial={{ opacity: 0, scale: 0.6, y: 30 }}
                            animate={{ 
                              opacity: 1, 
                              scale: pos.scale,
                              y: [0, -1.5, 0],
                              transition: { 
                                delay: index * 0.018,
                                y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' }
                              }
                            }}
                            whileHover={{ 
                              scale: pos.scale * 1.08, 
                              rotate: pos.rot * 0.6,
                              zIndex: 50,
                              transition: { duration: 0.18 }
                            }}
                            onClick={() => setSelected(drawing)}
                          >
                            <div className="relative">
                              <img 
                                src={drawing.image} 
                                alt={drawing.name}
                                className="w-[148px] md:w-[172px] rounded-2xl shadow-[0_20px_60px_-15px_rgb(0,0,0,0.6)] border border-white/10"
                                draggable={false}
                              />
                              {/* Hand-drawn label accent */}
                              <div className="absolute -bottom-2 -right-1 bg-black/90 px-2.5 py-px rounded text-[9px] font-mono tracking-[1px] text-white/70 border border-white/10">
                                {drawing.name.split(' ')[0].toUpperCase()}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}

                  <div className="text-center mt-8 text-[10px] tracking-[2px] text-white/40 font-mono">
                    LOS TRAZOS MÁS RECIENTES FLOTAN ARRIBA • DESLIZA PARA EXPLORAR
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* EXPANDED DRAWING MODAL — cinematic reveal */}
      <AnimatePresence>
        {selected && (
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 30 }}
              transition={{ type: 'spring', stiffness: 180, damping: 26 }}
              className="relative max-w-[920px] w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-zinc-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="relative">
                  <img 
                    src={selected.image} 
                    alt="Dibujo original"
                    className="w-full max-h-[72vh] object-contain bg-[#f8f5f0]"
                  />
                  
                  <button 
                    onClick={() => setSelected(null)}
                    className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center text-white/60 hover:text-white text-3xl transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-10 md:p-12 grid md:grid-cols-5 gap-y-8">
                  <div className="md:col-span-3">
                    <div className="font-mono text-xs tracking-[2px] text-[#9b5fd6] mb-1">TRAZO #{selected.id.slice(-6).toUpperCase()}</div>
                    <div className="text-4xl font-semibold tracking-tight text-white mb-4">
                      {selected.name}
                    </div>
                    {selected.message && (
                      <div className="text-[#8a7fa0] text-[17px] leading-snug max-w-[38ch]">
                        “{selected.message}”
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 md:pl-8 border-l border-white/10 text-sm">
                    <div className="text-white/40 text-xs tracking-widest mb-3">FECHA</div>
                    <div className="font-mono text-white mb-6">{formatDate(selected.timestamp)}</div>
                    
                    <div className="text-white/40 text-xs tracking-widest mb-3">HERRAMIENTA</div>
                    <div className="uppercase tracking-[1.5px] text-white mb-8">{selected.tool}</div>

                    <div className="pt-6 border-t border-white/10 text-[10px] text-white/40 font-mono tracking-widest">
                      ESTE DIBUJO FORMA PARTE DEL ARCHIVO PERMANENTE DE MARIANO MTZA
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
