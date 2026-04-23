'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useCanvasDrawing, TOOLS, COLORS } from '../hooks/useCanvasDrawing'
import { Drawing } from '../lib/types'
import { fetchWithRetry } from '../lib/fetchWithRetry'

export const Dibujos: React.FC = () => {
  const [mode, setMode] = useState<'dibujar' | 'galeria'>('galeria')
  const [gallery, setGallery] = useState<Drawing[]>([])
  const [selected, setSelected] = useState<Drawing | null>(null)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    strokeCount,
  } = useCanvasDrawing()

  // Load gallery from API
  useEffect(() => {
    const loadGallery = async () => {
      try {
        setLoading(true)
        const res = await fetchWithRetry('/api/drawings', {}, 2, 6000)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setGallery(data)
      } catch (err) {
        console.error('Failed to load gallery:', err)
        setError('No pudimos cargar la galería')
      } finally {
        setLoading(false)
      }
    }

    loadGallery()
  }, [])

  // Gallery positions — organic, pinned-note layout
  const galleryPositions = useMemo(() => {
    return gallery.slice(0, 14).map((_, i) => {
      const col = i % 5
      const row = Math.floor(i / 5)
      const seed = i * 0.6180339887
      return {
        x: 6 + col * 19 + (Math.sin(seed * 3) * 3.5),
        y: 8 + row * 34 + (Math.cos(seed * 2.3) * 4.2) + (row % 2 === 0 ? 3 : -2),
        rot: (i % 7 - 3.5) * 1.8 + Math.sin(seed) * 2.1,
        scale: 0.96 + (i % 4) * 0.015,
      }
    })
  }, [gallery])

  const handlePublish = async () => {
    const canvas = canvasRef.current
    if (!canvas || strokeCount === 0) {
      setError('Dibuja algo primero. Un trazo cuenta más que mil palabras.')
      return
    }

    setError('')
    setStatus('loading')

    const imageData = exportImage()
    if (!imageData) {
      setError('Error al capturar el dibujo')
      setStatus('idle')
      return
    }

    try {
      const res = await fetchWithRetry('/api/drawings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          name: name.trim() || 'Anónimo',
          message: message.trim(),
          tool: currentTool,
        }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to save')
      }
      const newDrawing = await res.json()

      // Add to gallery
      setGallery(prev => [newDrawing, ...prev])

      // Celebration
      confetti({
        particleCount: 140,
        spread: 65,
        origin: { y: 0.58 },
        colors: ['#9b5fd6', '#111111', '#f4f1f7'],
      })

      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 65,
          spread: 55,
          origin: { x: 0.18, y: 0.72 },
        })
      }, 240)

      // Reset
      setTimeout(() => {
        clear()
        setName('')
        setMessage('')
        setStatus('success')

        setTimeout(() => {
          setStatus('idle')
          setMode('galeria')
        }, 1650)
      }, 720)
    } catch (err) {
      console.error('Publish error:', err)
      const message = err instanceof Error ? err.message : 'No pudimos guardar tu dibujo. Intenta de nuevo.'
      setError(navigator.onLine ? message : 'Sin conexión. Revisa tu internet e intenta de nuevo.')
      setStatus('idle')
    }
  }

  return (
    <section id="dibujos" className="section py-24 border-t border-white/10 bg-black">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-12 gap-x-16">
          {/* LEFT — INTRO / STICKY */}
          <div className="md:col-span-5 mb-16 md:mb-0">
            <div className="sticky top-24">
              <div className="font-mono text-xs tracking-[0.24em] text-[#9b5fd6] mb-4">
                CUADERNO DE LA NOCHE
              </div>

              <h2 className="text-[64px] md:text-[72px] leading-[0.92] tracking-[-2.4px] font-semibold text-white mb-8">
                Déjame<br />un dibujo
              </h2>

              <div className="max-w-[36ch] text-[#8a7fa0] text-[15px] leading-relaxed mb-10">
                NO ACEPTO RESEÑAS NI OPINIONES, SOLO DIBUJITOS
              </div>

              <div className="flex items-center gap-4 text-xs font-mono tracking-[1.5px] text-white/40">
                <div className="w-px h-2.5 bg-[#9b5fd6]" />
                CADA TRAZO ES PÚBLICO
              </div>
            </div>
          </div>

          {/* RIGHT — INTERACTIVE CORE */}
          <div className="md:col-span-7">
            {/* MODE TOGGLE */}
            <div className="flex mb-8 border-b border-white/10">
              {(['dibujar', 'galeria'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 pb-4 text-sm tracking-[1.5px] font-medium transition-all relative ${
                    mode === m ? 'text-white' : 'text-white/40 hover:text-white/70'
                  }`}
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
              {/* DRAW MODE */}
              {mode === 'dibujar' && (
                <motion.div
                  key="draw"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-8"
                >
                  {/* TOOLBAR */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-zinc-950 rounded-2xl p-1 border border-white/10">
                      {TOOLS.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => setCurrentTool(tool.id)}
                          className={`px-5 py-2.5 text-xs tracking-[1.2px] font-medium rounded-xl transition-all flex items-center gap-2 ${
                            currentTool === tool.id
                              ? 'bg-[#9b5fd6] text-white shadow-lg'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="text-base">{tool.icon}</span>
                          {tool.label}
                        </button>
                      ))}
                    </div>

                    {/* Color swatches */}
                    <div className="flex items-center gap-2 ml-1">
                      {COLORS.map((col, idx) => (
                        <button
                          key={idx}
                          onClick={() => setColor(col)}
                          className={`w-7 h-7 rounded-full border transition-all ${
                            color === col
                              ? 'border-white scale-110 shadow-[0_0_0_3px_rgba(155,95,214,0.3)]'
                              : 'border-white/20 hover:border-white/50'
                          }`}
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
                        onClick={clear}
                        className="px-4 py-2 border border-white/20 hover:border-red-500 hover:text-red-500 rounded-full transition"
                      >
                        LIMPIAR
                      </button>
                    </div>
                  </div>

                  {/* CANVAS */}
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    onPointerDown={start}
                    onPointerMove={draw}
                    onPointerUp={stop}
                    onPointerLeave={stop}
                    className="w-full border border-white/10 rounded-2xl cursor-crosshair bg-white"
                  />

                  {/* FORM */}
                  <div className="space-y-6">
                    <div>
                      <label className="form-label">TU NOMBRE (OPCIONAL)</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Anónimo"
                        className="form-input"
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
                      onClick={handlePublish}
                      disabled={status === 'loading' || strokeCount === 0}
                      className="group flex items-center gap-4 px-10 py-4 bg-white text-black text-xs tracking-[2px] font-medium rounded-full disabled:opacity-60 hover:bg-[#9b5fd6] hover:text-white transition-all active:scale-[0.985]"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.985 }}
                    >
                      {status === 'loading'
                        ? 'GUARDANDO EN EL ARCHIVO...'
                        : status === 'success'
                          ? 'TRAZO AÑADIDO ✓'
                          : 'ENVIAR MI DIBUJO'}
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

              {/* GALLERY */}
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
                      <div className="font-mono text-xs tracking-[0.24em] text-[#9b5fd6]">
                        ARCHIVO VIVO • {gallery.length} TRAZOS
                      </div>
                      <div className="text-white/60 text-sm mt-1">
                        Pasa el cursor • Toca para ampliar
                      </div>
                    </div>
                    {gallery.length > 0 && (
                      <button
                        onClick={() => setMode('dibujar')}
                        className="text-xs tracking-widest border border-white/20 px-5 py-2 rounded-full hover:border-[#9b5fd6] hover:text-[#9b5fd6] transition"
                      >
                        + AÑADIR OTRO
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="h-[420px] flex items-center justify-center border border-white/10 rounded-3xl bg-zinc-950/50">
                      <div className="text-white/50">Cargando galería...</div>
                    </div>
                  ) : gallery.length === 0 ? (
                    <div className="h-[420px] flex flex-col items-center justify-center border border-white/10 rounded-3xl bg-zinc-950/50">
                      <div className="text-6xl mb-6 opacity-40">✎</div>
                      <div className="text-xl text-white/70 mb-2">El cuaderno está vacío</div>
                      <div className="text-sm text-white/50 max-w-[260px] text-center">
                        Sé el primero en dejar tu trazo. Tu dibujo se convertirá en parte de
                        la historia.
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
                        const rect = e.currentTarget.getBoundingClientRect()
                        const mx = (e.clientX - rect.left) / rect.width - 0.5
                        const my = (e.clientY - rect.top) / rect.height - 0.5

                        const cards = e.currentTarget.querySelectorAll('.gallery-card')
                        cards.forEach((card, idx) => {
                          const factor = (idx % 3 + 1) * 0.6
                          ;(card as HTMLElement).style.transform = `translate(${mx * factor}px, ${my * factor}px)`
                        })
                      }}
                    >
                      {gallery.slice(0, 14).map((drawing, index) => {
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
                                y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' },
                              },
                            }}
                            whileHover={{
                              scale: pos.scale * 1.08,
                              rotate: pos.rot * 0.6,
                              zIndex: 50,
                              transition: { duration: 0.18 },
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
                    SISTEMA PERSISTENTE
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Detail view */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full"
            >
              <img
                src={selected.image}
                alt={selected.name}
                className="w-full rounded-2xl border border-white/10"
              />
              <div className="mt-6 text-center">
                <div className="text-lg font-semibold text-white mb-2">{selected.name}</div>
                {selected.message && (
                  <div className="text-sm text-white/60 italic">"{selected.message}"</div>
                )}
                <div className="text-xs text-white/40 mt-3">
                  {new Date(selected.created_at).toLocaleDateString('es-MX')}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
