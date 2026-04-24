import { Drawing, DrawingPostResponse, DrawingsResponse, PendingDrawing, SavedDrawing } from './types'

export const DRAWING_DRAFT_KEY = 'mmtza-drawing-draft'
export const PENDING_DRAWINGS_KEY = 'mmtza-pending-drawings'
export const LOCAL_DRAWINGS_KEY = 'mmtza-local-drawings'

const MAX_PENDING = 10
const MAX_LOCAL = 24

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function readLocalDrawings(): SavedDrawing[] {
  try {
    return safeParse<SavedDrawing[]>(localStorage.getItem(LOCAL_DRAWINGS_KEY), [])
  } catch {
    return []
  }
}

export function writeLocalDrawings(drawings: SavedDrawing[]) {
  try {
    localStorage.setItem(LOCAL_DRAWINGS_KEY, JSON.stringify(drawings.slice(0, MAX_LOCAL)))
    return { ok: true as const }
  } catch {
    return { ok: false as const, error: 'No se pudo guardar en este dispositivo (storage lleno).' }
  }
}

export function readPendingDrawings(): PendingDrawing[] {
  try {
    return safeParse<PendingDrawing[]>(localStorage.getItem(PENDING_DRAWINGS_KEY), [])
  } catch {
    return []
  }
}

export function writePendingDrawings(drawings: PendingDrawing[]) {
  try {
    localStorage.setItem(PENDING_DRAWINGS_KEY, JSON.stringify(drawings.slice(0, MAX_PENDING)))
    return { ok: true as const }
  } catch {
    return { ok: false as const, error: 'No se pudo guardar en cola local (storage lleno).' }
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAWING_DRAFT_KEY)
  } catch {
    // ignore local storage failures
  }
}

export async function fetchDrawings(limit = 24, offset = 0): Promise<DrawingsResponse> {
  const response = await fetch(`/api/drawings?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('No se pudo cargar el museo')
  }

  const data = (await response.json()) as DrawingsResponse
  data.drawings = (data.drawings ?? []) as Drawing[]
  return data
}

export async function postDrawing(formData: FormData): Promise<DrawingPostResponse> {
  const response = await fetch('/api/drawings', {
    method: 'POST',
    body: formData,
  })

  const data = (await response.json().catch(() => null)) as DrawingPostResponse | null

  if (!response.ok || !data) {
    throw new Error((data as { error?: string } | null)?.error || 'No se pudo guardar el dibujo')
  }

  return data
}
