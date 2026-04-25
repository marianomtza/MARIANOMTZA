'use client'

import type { Drawing, PendingDrawing, DraftData } from './types'

// ─── Storage keys ─────────────────────────────────────────────────────────────
const LOCAL_KEY   = 'mmtza_drawings_v2'
const PENDING_KEY = 'mmtza_pending_v2'
const DRAFT_KEY   = 'mmtza_draft_v2'

// ─── Safe localStorage ────────────────────────────────────────────────────────
function lsGet(key: string): string | null {
  try { return typeof window !== 'undefined' ? localStorage.getItem(key) : null }
  catch { return null }
}
function lsSet(key: string, value: string): void {
  try { if (typeof window !== 'undefined') localStorage.setItem(key, value) }
  catch { /* storage full or unavailable */ }
}
function lsDel(key: string): void {
  try { if (typeof window !== 'undefined') localStorage.removeItem(key) }
  catch { /* noop */ }
}

// ─── Fetch drawings ───────────────────────────────────────────────────────────

/**
 * Fetch drawings from API. Falls back to localStorage cache on failure.
 * Caches first page locally (max 24) for offline resilience.
 */
export async function fetchDrawings(limit = 24, offset = 0): Promise<Drawing[]> {
  try {
    const res = await fetch(`/api/drawings?limit=${limit}&offset=${offset}`, {
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as Drawing[]
    // Only cache if we got real data — a [] response (e.g. no Supabase) must not wipe local cache
    if (offset === 0 && data.length > 0) {
      lsSet(LOCAL_KEY, JSON.stringify(data.slice(0, 24)))
    }
    return data
  } catch {
    const cached = lsGet(LOCAL_KEY)
    if (!cached) return []
    try {
      const all = JSON.parse(cached) as Drawing[]
      return all.slice(offset, offset + limit)
    } catch {
      return []
    }
  }
}

// ─── Post drawing ─────────────────────────────────────────────────────────────

/**
 * POST a drawing as multipart/form-data with full.webp + thumb.webp.
 * Throws 'NO_SUPABASE' if server returns 503.
 */
export async function postDrawing(
  fullBlob: Blob,
  thumbBlob: Blob,
  meta: { name: string; message: string; tool: string; website?: string },
): Promise<Drawing> {
  const form = new FormData()
  form.append('full',    fullBlob,  'full.webp')
  form.append('thumb',   thumbBlob, 'thumb.webp')
  form.append('name',    meta.name    || 'Anónimo')
  form.append('message', meta.message || '')
  form.append('tool',    meta.tool)
  if (meta.website) form.append('website', meta.website) // honeypot

  const res = await fetch('/api/drawings', { method: 'POST', body: form })

  if (res.status === 503) throw new Error('NO_SUPABASE')
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json() as Promise<Drawing>
}

// ─── Pending queue ────────────────────────────────────────────────────────────

export function readPendingDrawings(): PendingDrawing[] {
  const raw = lsGet(PENDING_KEY)
  if (!raw) return []
  try { return JSON.parse(raw) as PendingDrawing[] }
  catch { return [] }
}

function writePendingDrawings(queue: PendingDrawing[]): void {
  lsSet(PENDING_KEY, JSON.stringify(queue.slice(0, 10)))
}

export function addPendingDrawing(entry: PendingDrawing): void {
  const q = readPendingDrawings()
  writePendingDrawings([entry, ...q])
}

function b64ToBlob(b64: string): Blob {
  const bytes = atob(b64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: 'image/webp' })
}

/**
 * Try to sync pending drawings when back online.
 * Successfully synced items are removed from the queue.
 */
export async function syncPendingDrawings(): Promise<void> {
  const queue = readPendingDrawings()
  if (!queue.length) return

  const remaining: PendingDrawing[] = []
  for (const entry of queue) {
    try {
      await postDrawing(b64ToBlob(entry.fullB64), b64ToBlob(entry.thumbB64), {
        name: entry.name,
        message: entry.message,
        tool: entry.tool,
      })
    } catch {
      remaining.push(entry)
    }
  }
  writePendingDrawings(remaining)
}

/** Convert pending queue entries into display-ready Drawing objects for the gallery. */
export function pendingToDrawings(): Drawing[] {
  return readPendingDrawings().map(p => ({
    id:           p.localId,
    image:        `data:image/webp;base64,${p.thumbB64}`,
    name:         p.name,
    message:      p.message,
    tool:         p.tool,
    pending_sync: true,
    created_at:   new Date(p.timestamp).toISOString(),
  }))
}

// ─── Draft ────────────────────────────────────────────────────────────────────

export function saveDraft(data: DraftData): void {
  lsSet(DRAFT_KEY, JSON.stringify(data))
}

export function readDraft(): DraftData | null {
  const raw = lsGet(DRAFT_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as DraftData }
  catch { return null }
}

export function clearDraft(): void {
  lsDel(DRAFT_KEY)
}
