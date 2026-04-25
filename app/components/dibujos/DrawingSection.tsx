'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCanvasDrawing, TOOLS, BASE_COLORS } from '../../hooks/useCanvasDrawing'
import {
  fetchDrawings,
  postDrawing,
  addPendingDrawing,
  readPendingDrawings,
  syncPendingDrawings,
  pendingToDrawings,
} from '../../lib/drawings'
import type { Drawing, PendingDrawing } from '../../lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  if (mins < 1)   return 'ahora'
  if (mins < 60)  return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7)   return `hace ${days}d`
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

function thumbSrc(d: Drawing): string {
  return d.thumb_url || d.image_url || d.image || ''
}

function fullSrc(d: Drawing): string {
  return d.image_url || d.thumb_url || d.image || ''
}

function blobToB64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload  = () => res((reader.result as string).split(',')[1] ?? '')
    reader.onerror = rej
    reader.readAsDataURL(blob)
  })
}

// ─── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({
  drawing,
  onClose,
}: {
  drawing: Drawing
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href     = fullSrc(drawing)
    link.download = `dibujo-${drawing.name ?? 'anónimo'}.webp`
    link.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/92 backdrop-blur-sm p-4 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="relative w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute -top-10 right-0 text-white/60 hover:text-white text-sm tracking-widest font-mono transition"
        >
          CERRAR ✕
        </button>

        {/* Image */}
        <img
          src={fullSrc(drawing)}
          alt={`Dibujo de ${drawing.name}`}
          className="w-full rounded-2xl border border-white/10 bg-white"
          loading="lazy"
          decoding="async"
        />

        {/* Meta */}
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-white font-medium text-sm">
              {drawing.name || 'Anónimo'}
              {drawing.pending_sync && (
                <span className="ml-2 text-[10px] font-mono text-yellow-400/80 tracking-widest">
                  PENDIENTE
                </span>
              )}
            </div>
            {drawing.message && (
              <div className="text-white/50 text-sm italic mt-1">
                &ldquo;{drawing.message}&rdquo;
              </div>
            )}
            <div className="text-white/30 text-xs mt-1.5 font-mono">
              {relativeDate(drawing.created_at)}
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="shrink-0 text-xs font-mono tracking-widest border border-white/20 px-4 py-2 rounded-full hover:border-white/50 hover:text-white text-white/60 transition min-h-[44px] flex items-center"
          >
            PNG ↓
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DrawingSection() {
  // ── Canvas hook ─────────────────────────────────────────────────────────────
  const {
    canvasRef,
    activeTool,
    setActiveTool,
    color,
    setColor,
    size,
    setSize,
    strokeCount,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    undo,
    redo,
    clear,
    exportPng,
    exportWebpBlob,
    hasDraft,
    restoreDraft,
    discardDraft,
  } = useCanvasDrawing()

  // ── State ───────────────────────────────────────────────────────────────────
  const [name,    setName]    = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // honeypot

  type SubmitStatus = 'idle' | 'loading' | 'success' | 'local' | 'error'
  const [status,     setStatus]     = useState<SubmitStatus>('idle')
  const [statusMsg,  setStatusMsg]  = useState('')

  const [gallery,    setGallery]    = useState<Drawing[]>([])
  const [loadingGallery, setLoadingGallery] = useState(false)
  const [hasMore,    setHasMore]    = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selected,   setSelected]   = useState<Drawing | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [clearing,   setClearing]   = useState(false) // confirm clear

  const PAGE = 24
  const offsetRef = useRef(0)

  // ── Load gallery ─────────────────────────────────────────────────────────────
  const loadGallery = useCallback(async (reset = false) => {
    if (reset) {
      setLoadingGallery(true)
      offsetRef.current = 0
    }
    try {
      const remote = await fetchDrawings(PAGE, offsetRef.current)

      // Merge pending drawings (local-only) so they survive reloads.
      // Pending drawings are always prepended; remove any that appear in remote (synced).
      const pending = pendingToDrawings()
      const remoteIds = new Set(remote.map(d => d.id))
      const localOnly = pending.filter(p => !remoteIds.has(p.id))

      if (reset) {
        setGallery([...localOnly, ...remote])
      } else {
        setGallery(prev => {
          // On "load more", keep existing pending at top, append new remote pages
          const existingIds = new Set(prev.map(d => d.id))
          const fresh = remote.filter(d => !existingIds.has(d.id))
          return [...prev, ...fresh]
        })
      }
      setHasMore(remote.length === PAGE)
      offsetRef.current += remote.length
    } catch {
      // fetchDrawings already handles fallback internally
    } finally {
      setLoadingGallery(false)
    }
  }, [])

  useEffect(() => { loadGallery(true) }, [loadGallery])

  // ── Pending count ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setPendingCount(readPendingDrawings().length)
  }, [])

  // ── Online sync ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onOnline = async () => {
      await syncPendingDrawings()
      setPendingCount(readPendingDrawings().length)
      loadGallery(true)
    }
    window.addEventListener('online', onOnline, { passive: true })
    return () => window.removeEventListener('online', onOnline)
  }, [loadGallery])

  // ── Load more ─────────────────────────────────────────────────────────────────
  const loadMore = async () => {
    if (loadingMore) return
    setLoadingMore(true)
    await loadGallery(false)
    setLoadingMore(false)
  }

  // ── Export PNG ────────────────────────────────────────────────────────────────
  const handleExportPng = () => {
    const dataUrl = exportPng()
    if (!dataUrl) return
    const link = document.createElement('a')
    link.href     = dataUrl
    link.download = 'dibujo.png'
    link.click()
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (strokeCount === 0) {
      setStatus('error')
      setStatusMsg('Primero dibuja algo.')
      return
    }

    setStatus('loading')
    setStatusMsg('Colgando…')

    try {
      const [fullBlob, thumbBlob] = await Promise.all([
        exportWebpBlob(1200, 0.88),
        exportWebpBlob(480,  0.88),
      ])

      if (!fullBlob || !thumbBlob) throw new Error('export_failed')

      const drawing = await postDrawing(fullBlob, thumbBlob, {
        name:    name.trim()    || 'Anónimo',
        message: message.trim() || '',
        tool:    activeTool,
        website,
      })

      setGallery(prev => [drawing, ...prev])
      setStatus('success')
      setStatusMsg('Dibujo colgado.')
      clear()
      setName('')
      setMessage('')

      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      const isNoSupabase = err instanceof Error && err.message === 'NO_SUPABASE'

      // Save locally as pending
      try {
        const [fullBlob, thumbBlob] = await Promise.all([
          exportWebpBlob(1200, 0.88),
          exportWebpBlob(480,  0.88),
        ])
        if (fullBlob && thumbBlob) {
          const [fb64, tb64] = await Promise.all([
            blobToB64(fullBlob),
            blobToB64(thumbBlob),
          ])
          const localId = `local-${Date.now()}`
          const pending: PendingDrawing = {
            localId,
            fullB64:  fb64,
            thumbB64: tb64,
            name:     name.trim()    || 'Anónimo',
            message:  message.trim() || '',
            tool:     activeTool,
            timestamp: Date.now(),
          }
          addPendingDrawing(pending)
          setPendingCount(readPendingDrawings().length)

          // Show locally in gallery
          const localDrawing: Drawing = {
            id:           localId,
            image:        `data:image/webp;base64,${tb64}`,
            name:         pending.name,
            message:      pending.message,
            tool:         activeTool,
            pending_sync: true,
            created_at:   new Date().toISOString(),
          }
          setGallery(prev => [localDrawing, ...prev])
          setStatus('local')
          setStatusMsg(
            isNoSupabase
              ? 'Guardado localmente. Se sincronizará cuando haya conexión.'
              : 'Error de red. Guardado localmente.',
          )
          clear()
          setName('')
          setMessage('')
          setTimeout(() => setStatus('idle'), 4000)
          return
        }
      } catch {
        /* fall through */
      }

      setStatus('error')
      setStatusMsg('No se pudo guardar. Intenta de nuevo.')
      setTimeout(() => setStatus('idle'), 3500)
    }
  }

  // ── Clear with confirmation ───────────────────────────────────────────────────
  const handleClear = () => {
    if (strokeCount === 0) return
    if (!clearing) { setClearing(true); return }
    clear()
    setClearing(false)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <section
      id="dibujos"
      className="py-24 border-t border-white/8 bg-[var(--bg)]"
      aria-label="Deja tu dibujo"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="mb-14">
          <div className="font-mono text-[10px] tracking-[0.3em] text-white/30 mb-3">
            PARED ABIERTA
          </div>
          <h2 className="text-[56px] md:text-[72px] leading-[0.9] tracking-[-2px] font-semibold text-white mb-5">
            DEJA TU DIBUJO
          </h2>
          <p className="text-white/40 text-sm max-w-[38ch] leading-relaxed">
            No acepto reseñas, ni opiniones, solo dibujitos.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-12 lg:gap-16">

          {/* ── LEFT: Canvas area ─────────────────────────────────────────── */}
          <div className="md:col-span-7 space-y-5">

            {/* Draft restore banner */}
            <AnimatePresence>
              {hasDraft && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-white/10 bg-white/3 text-sm"
                >
                  <span className="text-white/60">
                    Hay un borrador guardado.
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={restoreDraft}
                      className="text-xs font-mono tracking-widest text-[#8B5CF6] hover:text-white transition"
                    >
                      RESTAURAR
                    </button>
                    <button
                      onClick={discardDraft}
                      className="text-xs font-mono tracking-widest text-white/30 hover:text-white/70 transition"
                    >
                      DESCARTAR
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Toolbar ──────────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3">

              {/* Tools */}
              <div className="flex items-center bg-black/40 rounded-2xl p-1 border border-white/10">
                {TOOLS.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    aria-label={tool.label}
                    className={`
                      px-4 py-2 text-[10px] tracking-[1.2px] font-medium rounded-xl transition-all
                      flex items-center gap-1.5 min-h-[40px]
                      ${activeTool === tool.id
                        ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20'
                        : 'text-white/50 hover:text-white hover:bg-white/5'}
                    `}
                  >
                    <span className="text-sm">{tool.icon}</span>
                    {tool.label}
                  </button>
                ))}
              </div>

              {/* Size slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-white/30 tracking-widest">
                  TAMAÑO
                </span>
                <input
                  type="range"
                  min={1}
                  max={activeTool === 'eraser' ? 60 : 24}
                  step={1}
                  value={size}
                  onChange={e => setSize(Number(e.target.value))}
                  aria-label="Tamaño del trazo"
                  className="w-20 accent-[#8B5CF6]"
                />
                <span className="text-[10px] font-mono text-white/30 w-5 text-right">
                  {Math.round(size)}
                </span>
              </div>

              <div className="flex-1" />

              {/* Undo / Redo */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={undo}
                  aria-label="Deshacer"
                  className="px-3 py-2 text-[10px] font-mono tracking-widest border border-white/15 rounded-full
                             hover:border-[#8B5CF6] hover:text-[#8B5CF6] text-white/50 transition min-h-[40px]"
                >
                  ↩ DESHACER
                </button>
                <button
                  onClick={redo}
                  aria-label="Rehacer"
                  className="px-3 py-2 text-[10px] font-mono tracking-widest border border-white/15 rounded-full
                             hover:border-[#8B5CF6] hover:text-[#8B5CF6] text-white/50 transition min-h-[40px]"
                >
                  REHACER ↪
                </button>
                <button
                  onClick={handleClear}
                  onBlur={() => setClearing(false)}
                  aria-label={clearing ? 'Confirmar limpiar' : 'Limpiar lienzo'}
                  className={`px-3 py-2 text-[10px] font-mono tracking-widest border rounded-full
                              transition min-h-[40px]
                              ${clearing
                                ? 'border-red-500 text-red-400 bg-red-500/10'
                                : 'border-white/15 text-white/50 hover:border-red-500 hover:text-red-400'}`}
                >
                  {clearing ? 'CONFIRMAR' : 'LIMPIAR'}
                </button>
              </div>
            </div>

            {/* ── Color picker ──────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Free color */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="color-libre"
                  className="text-[10px] font-mono tracking-widest text-white/40"
                >
                  Color libre
                </label>
                <input
                  id="color-libre"
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  aria-label="Color libre"
                  className="w-11 h-11 rounded-full border-2 border-white/20 cursor-pointer bg-transparent"
                  style={{ padding: '2px' }}
                />
              </div>

              {/* Quick swatches — exactly 5, no white */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-white/40">
                  Color rápido
                </span>
                {BASE_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    aria-label={`Color ${c}`}
                    title={c}
                    className={`
                      w-8 h-8 rounded-full border-2 transition-all duration-150 min-h-[44px] min-w-[44px]
                      ${color.toLowerCase() === c.toLowerCase()
                        ? 'border-white scale-110 shadow-[0_0_0_3px_rgba(139,92,246,0.35)]'
                        : 'border-white/20 hover:border-white/60'}
                    `}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* ── Canvas ────────────────────────────────────────────────────── */}
            <canvas
              ref={canvasRef}
              className="w-full aspect-[4/3] rounded-2xl border border-white/10 bg-white cursor-crosshair touch-none block"
              style={{ touchAction: 'none' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              aria-label="Lienzo de dibujo"
            />

            {/* ── Form + actions ────────────────────────────────────────────── */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-[0.2em] text-white/30">
                  TU NOMBRE (OPCIONAL)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Anónimo"
                  maxLength={60}
                  className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3
                             text-sm text-white placeholder-white/20 focus:outline-none
                             focus:border-[#8B5CF6] transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-[0.2em] text-white/30">
                  MENSAJE CORTO (OPCIONAL)
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="La noche se sintió como esto…"
                  maxLength={200}
                  className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3
                             text-sm text-white placeholder-white/20 focus:outline-none
                             focus:border-[#8B5CF6] transition"
                />
              </div>
            </div>

            {/* Honeypot — hidden from real users */}
            <input
              type="text"
              name="website"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              aria-hidden
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            {/* Submit + export row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                onClick={handleExportPng}
                disabled={strokeCount === 0}
                className="text-[10px] font-mono tracking-widest border border-white/15 px-4 py-2.5
                           rounded-full text-white/50 hover:border-white/40 hover:text-white/80
                           disabled:opacity-30 transition min-h-[44px] w-full sm:w-auto"
              >
                PNG ↓
              </button>

              <button
                onClick={handleSubmit}
                disabled={status === 'loading'}
                className={`
                  flex items-center gap-3 px-8 py-3.5 rounded-full text-[11px] tracking-[2px]
                  font-medium transition-all min-h-[48px] disabled:opacity-50 w-full sm:w-auto justify-center
                  ${status === 'success'
                    ? 'bg-emerald-500 text-white'
                    : status === 'local'
                      ? 'bg-yellow-500/90 text-black'
                      : 'bg-white text-black hover:bg-[#8B5CF6] hover:text-white'}
                `}
              >
                {status === 'loading'  ? 'Colgando…'
                  : status === 'success' ? 'Dibujo colgado ✓'
                  : status === 'local'   ? 'Guardado localmente'
                  : 'Colgar dibujo'}
                {status === 'idle' && <span>↗</span>}
              </button>
            </div>

            {/* Status message */}
            <AnimatePresence>
              {statusMsg && (
                <motion.p
                  key={statusMsg}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-xs font-mono tracking-wide ${
                    status === 'error' ? 'text-red-400' : 'text-white/40'
                  }`}
                >
                  {statusMsg}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT: Gallery ────────────────────────────────────────────── */}
          <div className="md:col-span-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-mono text-[10px] tracking-[0.3em] text-white/30 mb-1">
                  Dibujos colgados
                </div>
                <div className="text-white/50 text-sm">
                  {gallery.length > 0 ? `${gallery.length} en la pared` : ''}
                </div>
              </div>
              {pendingCount > 0 && (
                <div className="text-[10px] font-mono tracking-widest text-yellow-400/70">
                  {pendingCount} PENDIENTE{pendingCount > 1 ? 'S' : ''}
                </div>
              )}
            </div>

            {loadingGallery ? (
              <div className="h-[360px] flex items-center justify-center border border-white/8 rounded-2xl">
                <span className="text-white/25 text-sm font-mono tracking-widest animate-pulse">
                  CARGANDO…
                </span>
              </div>
            ) : gallery.length === 0 ? (
              <div className="h-[360px] flex flex-col items-center justify-center border border-white/8 rounded-2xl gap-4 text-center px-8">
                <div className="text-5xl opacity-20">✎</div>
                <div className="text-white/40 text-sm">
                  Todavía no hay dibujos en la pared.
                </div>
                <div className="text-white/25 text-xs">
                  Sé la primera señal.
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {gallery.map(drawing => (
                    <motion.button
                      key={drawing.id}
                      onClick={() => setSelected(drawing)}
                      className="group relative aspect-square rounded-xl overflow-hidden
                                 border border-white/8 hover:border-white/25 transition-all
                                 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <img
                        src={thumbSrc(drawing)}
                        alt={`Dibujo de ${drawing.name}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover bg-white"
                      />
                      {drawing.pending_sync && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-400" />
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end p-2.5">
                        <span className="text-[9px] font-mono tracking-widest text-white/0
                                         group-hover:text-white/80 transition-all truncate">
                          {drawing.name || 'Anónimo'}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="mt-6 w-full py-3 border border-white/10 rounded-xl text-[10px]
                               font-mono tracking-widest text-white/40 hover:border-white/25
                               hover:text-white/70 transition disabled:opacity-40 min-h-[44px]"
                  >
                    {loadingMore ? 'CARGANDO…' : 'CARGAR MÁS'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <Lightbox drawing={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}
