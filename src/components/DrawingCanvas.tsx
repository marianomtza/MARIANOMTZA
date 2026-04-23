import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Point {
  x: number
  y: number
  pressure: number
}

interface Stroke {
  points: Point[]
  color: string
  size: number
  tool: 'pencil' | 'marker' | 'ink'
}

interface DrawingCanvasProps {
  onSave: (drawingData: { strokes: Stroke[]; name: string; message: string; preview: string }) => void
  onClose: () => void
}

const TOOLS = [
  { id: 'pencil', label: 'PENCIL', icon: '✏️', color: '#111', size: 1.5 },
  { id: 'marker', label: 'MARKER', icon: '🖊️', color: '#9b5fd6', size: 4 },
  { id: 'ink', label: 'INK', icon: '🖋️', color: '#4a2c7a', size: 2.5 },
] as const

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [currentStroke, setCurrentStroke] = useState<Point[]>([])
  const [tool, setTool] = useState<'pencil' | 'marker' | 'ink'>('pencil')
  const [color, setColor] = useState('#111111')
  const [size, setSize] = useState(2.5)
  const [isDrawing, setIsDrawing] = useState(false)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const colors = ['#111111', '#9b5fd6', '#ffffff', '#4a2c7a', '#e11d48']

  // Get canvas context
  const getCtx = () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext('2d', { alpha: true })
  }

  // Resize canvas
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    const ctx = getCtx()
    if (ctx) {
      ctx.scale(2, 2)
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
    }
  }, [])

  // Draw all strokes
  const redraw = useCallback(() => {
    const ctx = getCtx()
    if (!ctx || !canvasRef.current) return

    ctx.clearRect(0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2)

    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return

      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.size

      if (stroke.tool === 'ink') {
        ctx.globalAlpha = 0.7
        ctx.shadowBlur = 3
        ctx.shadowColor = stroke.color
      } else if (stroke.tool === 'marker') {
        ctx.globalAlpha = 0.85
      } else {
        ctx.globalAlpha = 0.95
      }

      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

      for (let i = 1; i < stroke.points.length; i++) {
        const p = stroke.points[i]
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    })

    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  }, [strokes])

  // Add point to current stroke
  const addPoint = (x: number, y: number, pressure = 0.5) => {
    const newPoint: Point = { x, y, pressure }
    setCurrentStroke(prev => [...prev, newPoint])
    
    // Live draw
    const ctx = getCtx()
    if (!ctx || currentStroke.length === 0) return

    const lastPoint = currentStroke[currentStroke.length - 1] || newPoint
    
    ctx.strokeStyle = color
    ctx.lineWidth = size * (tool === 'marker' ? 1.8 : tool === 'ink' ? 0.9 : 0.6)
    
    if (tool === 'ink') {
      ctx.globalAlpha = 0.65 + (pressure * 0.2)
      ctx.shadowBlur = 2
      ctx.shadowColor = color
    } else {
      ctx.globalAlpha = tool === 'marker' ? 0.9 : 1
    }

    ctx.beginPath()
    ctx.moveTo(lastPoint.x, lastPoint.y)
    ctx.lineTo(x, y)
    ctx.stroke()

    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  }

  // Mouse / Touch handlers
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    setIsDrawing(true)
    setCurrentStroke([{ x, y, pressure: 0.6 }])
  }

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    addPoint(x, y, 0.5 + Math.random() * 0.3)
  }

  const handleEnd = () => {
    if (!isDrawing || currentStroke.length < 2) {
      setIsDrawing(false)
      setCurrentStroke([])
      return
    }

    const newStroke: Stroke = {
      points: currentStroke,
      color,
      size,
      tool,
    }

    setStrokes(prev => [...prev, newStroke])
    setCurrentStroke([])
    setIsDrawing(false)
  }

  // Undo last stroke
  const undo = () => {
    if (strokes.length === 0) return
    setStrokes(prev => prev.slice(0, -1))
  }

  // Clear all
  const clearCanvas = () => {
    setStrokes([])
    const ctx = getCtx()
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2)
    }
  }

  // Save drawing
  const handleSave = async () => {
    if (strokes.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Create preview
    const previewCanvas = document.createElement('canvas')
    previewCanvas.width = 420
    previewCanvas.height = 280
    const pCtx = previewCanvas.getContext('2d')!

    pCtx.fillStyle = '#f8f7f4'
    pCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height)

    // Scale and draw strokes
    const scaleX = previewCanvas.width / canvas.width * 2
    const scaleY = previewCanvas.height / canvas.height * 2

    strokes.forEach(stroke => {
      pCtx.strokeStyle = stroke.color
      pCtx.lineWidth = stroke.size * 0.7
      pCtx.lineJoin = 'round'
      pCtx.lineCap = 'round'
      pCtx.globalAlpha = stroke.tool === 'ink' ? 0.75 : 0.95

      pCtx.beginPath()
      pCtx.moveTo(stroke.points[0].x * scaleX, stroke.points[0].y * scaleY)
      stroke.points.forEach(p => {
        pCtx.lineTo(p.x * scaleX, p.y * scaleY)
      })
      pCtx.stroke()
    })

    const preview = previewCanvas.toDataURL('image/png')

    const drawingData = {
      strokes,
      name: name.trim() || 'Anonymous',
      message: message.trim(),
      preview,
    }

    onSave(drawingData)
    setShowSuccess(true)

    setTimeout(() => {
      setShowSuccess(false)
      onClose()
      // Reset
      setStrokes([])
      setName('')
      setMessage('')
    }, 1800)
  }

  // Effects
  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [resizeCanvas])

  useEffect(() => {
    redraw()
  }, [strokes, redraw])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 30 }}
        className="relative w-full max-w-[820px] bg-[#f8f7f4] rounded-3xl overflow-hidden shadow-2xl border border-black/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-black/10 bg-white">
          <div>
            <div className="font-mono text-[10px] tracking-[3px] text-[#9b5fd6]">DÉJAME UN DIBUJO</div>
            <div className="text-xl font-semibold tracking-tight">Digital Sketchbook</div>
          </div>
          <button onClick={onClose} className="text-2xl text-black/40 hover:text-black transition">✕</button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Canvas Area */}
          <div className="relative flex-1 p-6 bg-[#f8f7f4]">
            <div className="relative rounded-2xl overflow-hidden border border-black/10 shadow-inner" style={{ aspectRatio: '16/10' }}>
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
              />
              
              {/* Paper texture overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.035]" 
                   style={{ 
                     backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                     backgroundSize: 'cover'
                   }} 
              />
            </div>

            {/* Tool Info */}
            <div className="mt-3 text-[10px] text-black/50 font-mono tracking-widest flex justify-between">
              <div>DRAG TO DRAW • {tool.toUpperCase()}</div>
              <div>{strokes.length} STROKES</div>
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-black/10 p-6 bg-white flex flex-col">
            {/* Tools */}
            <div className="mb-8">
              <div className="text-[10px] tracking-[2px] text-black/60 mb-3 font-mono">TOOLS</div>
              <div className="flex gap-2">
                {TOOLS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTool(t.id)
                      setColor(t.color)
                      setSize(t.size)
                    }}
                    className={`flex-1 py-3 rounded-xl border text-xs transition-all flex flex-col items-center gap-1
                      ${tool === t.id 
                        ? 'border-[#9b5fd6] bg-[#9b5fd6]/5 text-[#9b5fd6]' 
                        : 'border-black/10 hover:border-black/30'}`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="font-mono tracking-widest text-[9px]">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="mb-8">
              <div className="text-[10px] tracking-[2px] text-black/60 mb-3 font-mono">COLOR</div>
              <div className="flex gap-2 flex-wrap">
                {colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setColor(c)}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${color === c ? 'border-black scale-110' : 'border-black/10'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-8">
              <div className="flex justify-between text-[10px] tracking-[2px] text-black/60 mb-2 font-mono">
                <div>SIZE</div>
                <div>{size.toFixed(1)}</div>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="8" 
                step="0.1"
                value={size}
                onChange={(e) => setSize(parseFloat(e.target.value))}
                className="w-full accent-[#9b5fd6]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 mb-8">
              <button 
                onClick={undo} 
                disabled={strokes.length === 0}
                className="flex-1 py-3 text-xs border border-black/10 rounded-xl hover:bg-black/5 disabled:opacity-40 transition"
              >
                UNDO
              </button>
              <button 
                onClick={clearCanvas} 
                disabled={strokes.length === 0}
                className="flex-1 py-3 text-xs border border-black/10 rounded-xl hover:bg-black/5 disabled:opacity-40 transition"
              >
                CLEAR
              </button>
            </div>

            {/* Form */}
            <div className="mt-auto space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="YOUR NAME (OPTIONAL)" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b border-black/20 pb-2 text-sm placeholder:text-black/40 focus:border-[#9b5fd6] outline-none font-mono tracking-widest"
                />
              </div>
              <div>
                <textarea 
                  placeholder="A NOTE OR THOUGHT..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent border-b border-black/20 pb-2 text-sm placeholder:text-black/40 focus:border-[#9b5fd6] outline-none resize-y font-mono tracking-widest"
                />
              </div>

              <motion.button
                onClick={handleSave}
                disabled={strokes.length === 0}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                className="w-full py-4 mt-4 bg-black text-white text-xs tracking-[2px] font-medium rounded-full disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-[#9b5fd6] transition-all"
              >
                ADD TO THE WALL
                <span>↗</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Success Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#f8f7f4]/95 flex items-center justify-center z-10"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">✍️</div>
                <div className="text-2xl font-semibold tracking-tight mb-2">Drawing saved</div>
                <div className="text-sm text-black/60">Added to the living wall</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default DrawingCanvas
