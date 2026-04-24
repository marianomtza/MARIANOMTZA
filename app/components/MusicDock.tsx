'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Track {
  id: string
  title: string
  artist: string
  artwork: string
  preview: string
  album: string
}

const SEED_ARTISTS = ['Sega Bodega', 'Oklou'] as const

async function fetchTracksForArtist(artist: string): Promise<Track[]> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&media=music&entity=song&limit=5`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = (await res.json()) as {
    results: Array<{
      trackId: number
      trackName: string
      artistName: string
      previewUrl: string
      artworkUrl100: string
      collectionName: string
    }>
  }
  return (data.results ?? [])
    .filter((t) => t.previewUrl && t.artistName.toLowerCase().includes(artist.toLowerCase().split(' ')[0]))
    .map((t) => ({
      id: String(t.trackId),
      title: t.trackName,
      artist: t.artistName,
      artwork: t.artworkUrl100.replace('100x100', '400x400'),
      preview: t.previewUrl,
      album: t.collectionName,
    }))
}

export const MusicDock: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([])
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const results = await Promise.all(SEED_ARTISTS.map(fetchTracksForArtist))
      const flat = results.flat()
      // Interleave artists so first track isn't all Sega Bodega
      const maxLen = Math.max(...results.map((r) => r.length))
      const interleaved: Track[] = []
      for (let i = 0; i < maxLen; i++) {
        for (const group of results) {
          if (group[i]) interleaved.push(group[i])
        }
      }
      if (!cancelled) {
        setTracks(interleaved.length > 0 ? interleaved : flat)
        setLoaded(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const track = useMemo(() => tracks[index], [tracks, index])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !track) return
    audio.src = track.preview
    audio.load()
    if (playing) {
      void audio.play().catch(() => setPlaying(false))
    }
  }, [track])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      void audio.play().catch(() => setPlaying(false))
    } else {
      audio.pause()
    }
  }, [playing])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const update = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration)
    }
    const onEnd = () => {
      setProgress(0)
      setIndex((i) => (i + 1) % tracks.length)
    }
    audio.addEventListener('timeupdate', update)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', update)
      audio.removeEventListener('ended', onEnd)
    }
  }, [tracks.length])

  const togglePlay = () => setPlaying((p) => !p)
  const next = () => setIndex((i) => (i + 1) % Math.max(tracks.length, 1))
  const prev = () => setIndex((i) => (i - 1 + Math.max(tracks.length, 1)) % Math.max(tracks.length, 1))

  if (!loaded || !track) {
    return null
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-1/2 -translate-x-1/2 bottom-4 z-[70] w-[min(94vw,520px)] pointer-events-none"
    >
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />
      <div className="glass rounded-2xl overflow-hidden pointer-events-auto shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
        {/* Main row */}
        <div className="flex items-center gap-3 p-2.5 pl-3">
          {/* Artwork */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="relative h-11 w-11 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-[var(--line)]"
            aria-label="Ver tracklist"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={track.artwork} alt={track.album} className="h-full w-full object-cover" />
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-[var(--fg)] font-medium truncate">{track.title}</div>
            <div className="text-[11px] text-[var(--fg-muted)] truncate font-mono tracking-wide">
              {track.artist}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={prev}
              aria-label="Anterior"
              className="h-9 w-9 rounded-full text-[var(--fg-muted)] hover:text-[var(--fg)] transition"
            >
              ⤶
            </button>
            <button
              onClick={togglePlay}
              aria-label={playing ? 'Pausa' : 'Reproducir'}
              className="h-10 w-10 rounded-full bg-[var(--fg)] text-[var(--bg)] flex items-center justify-center hover:scale-105 transition"
            >
              {playing ? (
                <span className="flex gap-[3px]">
                  <span className="w-[3px] h-3 bg-[var(--bg)]" />
                  <span className="w-[3px] h-3 bg-[var(--bg)]" />
                </span>
              ) : (
                <span
                  className="w-0 h-0 border-l-[9px] border-l-[var(--bg)] border-y-[6px] border-y-transparent translate-x-[1px]"
                  aria-hidden
                />
              )}
            </button>
            <button
              onClick={next}
              aria-label="Siguiente"
              className="h-9 w-9 rounded-full text-[var(--fg-muted)] hover:text-[var(--fg)] transition"
            >
              ⤷
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="h-[2px] bg-[var(--line)] overflow-hidden">
          <motion.div
            className="h-full bg-[var(--accent)]"
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </div>

        {/* Expanded tracklist */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-[var(--line)]"
            >
              <div className="max-h-[280px] overflow-y-auto py-2">
                {tracks.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setIndex(i)
                      setPlaying(true)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[var(--bg-elevated)]/60 transition ${
                      i === index ? 'bg-[var(--bg-elevated)]/40' : ''
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.artwork}
                      alt=""
                      className="h-8 w-8 rounded object-cover flex-shrink-0 ring-1 ring-[var(--line)]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-[var(--fg)] truncate">{t.title}</div>
                      <div className="text-[10px] text-[var(--fg-muted)] truncate font-mono">
                        {t.artist}
                      </div>
                    </div>
                    {i === index && playing && (
                      <span className="flex items-end gap-[2px] h-3 text-[var(--accent)]">
                        <motion.span
                          className="w-[2px] bg-[var(--accent)]"
                          animate={{ height: ['30%', '100%', '50%'] }}
                          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                        />
                        <motion.span
                          className="w-[2px] bg-[var(--accent)]"
                          animate={{ height: ['80%', '30%', '100%'] }}
                          transition={{ duration: 0.7, repeat: Infinity, repeatType: 'reverse' }}
                        />
                        <motion.span
                          className="w-[2px] bg-[var(--accent)]"
                          animate={{ height: ['50%', '80%', '30%'] }}
                          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                        />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="px-3 py-2 text-[9px] text-[var(--fg-muted)] font-mono tracking-[0.22em] uppercase border-t border-[var(--line)] flex items-center justify-between">
                <span>Preview · 30s</span>
                <a
                  href="https://music.apple.com/mx/playlist/musical-monday/pl.u-9WpbHaq6d86?l=en"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[var(--accent)] hover:opacity-80 transition"
                >
                  Apple Music · Musical Monday
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
