import { BookingPayload, Drawing } from './types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function safeTrim(value: unknown, max = 300): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max)
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function parsePagination(searchParams: URLSearchParams) {
  const rawLimit = Number.parseInt(searchParams.get('limit') || '50', 10)
  const rawOffset = Number.parseInt(searchParams.get('offset') || '0', 10)

  const limit = Number.isFinite(rawLimit) ? clampNumber(rawLimit, 1, 50) : 50
  const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0

  return { limit, offset }
}

export function validateBookingPayload(input: unknown):
  | { ok: true; data: BookingPayload }
  | { ok: false; error: string } {
  const body = (input || {}) as Partial<BookingPayload>

  const payload: BookingPayload = {
    name: safeTrim(body.name, 120),
    email: safeTrim(body.email, 160).toLowerCase(),
    artist: safeTrim(body.artist, 140),
    date: safeTrim(body.date, 40),
    city: safeTrim(body.city, 140),
    venue: safeTrim(body.venue, 140),
    capacity: safeTrim(body.capacity, 60),
    event_type: safeTrim(body.event_type, 80),
    event_name: safeTrim(body.event_name, 160),
    budget: safeTrim(body.budget, 60),
    notes: safeTrim(body.notes, 1500),
  }

  if (!payload.name || !payload.email || !payload.date || !payload.city) {
    return { ok: false, error: 'Missing required fields' }
  }

  if (!EMAIL_RE.test(payload.email)) {
    return { ok: false, error: 'Invalid email format' }
  }

  return { ok: true, data: payload }
}

const DATA_URL_RE = /^data:image\/(png|jpeg|jpg|webp);base64,[a-zA-Z0-9+/=\n\r]+$/
const DRAWING_TOOLS: Drawing['tool'][] = ['pencil', 'marker', 'ink']
const MAX_IMAGE_CHARS = 1_400_000

export function validateDrawingPayload(input: unknown):
  | { ok: true; data: Pick<Drawing, 'image' | 'name' | 'message' | 'tool'> }
  | { ok: false; error: string } {
  const body = (input || {}) as Partial<Drawing>
  const image = typeof body.image === 'string' ? body.image.trim() : ''

  if (!image) {
    return { ok: false, error: 'Missing image payload' }
  }

  if (image.length > MAX_IMAGE_CHARS) {
    return { ok: false, error: 'Image payload too large' }
  }

  if (!DATA_URL_RE.test(image)) {
    return { ok: false, error: 'Image format is invalid' }
  }

  const tool = DRAWING_TOOLS.includes(body.tool as Drawing['tool']) ? (body.tool as Drawing['tool']) : 'pencil'

  return {
    ok: true,
    data: {
      image,
      name: safeTrim(body.name, 80) || 'Anónimo',
      message: safeTrim(body.message, 300),
      tool,
    },
  }
}
