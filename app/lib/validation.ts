import type { BookingPayload } from './types'

const MAX_TEXT = 400
const MAX_NOTES = 1500

export class ValidationError extends Error {
  constructor(
    message: string,
    public status: 400 | 422 = 422
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

function sanitizeText(input: unknown, max = MAX_TEXT) {
  const value = typeof input === 'string' ? input.trim().replace(/\s+/g, ' ') : ''
  return value.slice(0, max)
}

export function sanitizeOptionalText(input: unknown, max = MAX_TEXT) {
  return sanitizeText(input, max)
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function parseJSONSafely<T>(raw: unknown): T {
  if (!raw || typeof raw !== 'object') {
    throw new ValidationError('Invalid JSON body', 400)
  }
  return raw as T
}

export function isDataUrlImage(input: string) {
  return /^data:image\/(png|jpeg|jpg|webp);base64,[a-zA-Z0-9+/=]+$/.test(input)
}

export function dataUrlSizeInBytes(dataUrl: string) {
  const payload = dataUrl.split(',')[1] ?? ''
  return Math.ceil((payload.length * 3) / 4)
}

export function validateBookingPayload(input: unknown): BookingPayload {
  const raw = parseJSONSafely<Partial<BookingPayload>>(input)

  const payload: BookingPayload = {
    name: sanitizeText(raw.name, 120),
    email: sanitizeText(raw.email, 160).toLowerCase(),
    artist: sanitizeOptionalText(raw.artist, 120),
    date: sanitizeText(raw.date, 60),
    city: sanitizeText(raw.city, 120),
    venue: sanitizeOptionalText(raw.venue, 120),
    capacity: sanitizeOptionalText(raw.capacity, 60),
    event_type: sanitizeOptionalText(raw.event_type, 80),
    event_name: sanitizeOptionalText(raw.event_name, 120),
    budget: sanitizeOptionalText(raw.budget, 80),
    notes: sanitizeOptionalText(raw.notes, MAX_NOTES),
  }

  if (!payload.name || !payload.email || !payload.date || !payload.city) {
    throw new ValidationError('Missing required fields: name, email, date, city')
  }

  if (!validateEmail(payload.email)) {
    throw new ValidationError('Invalid email format')
  }

  return payload
}

export function getSafePagination(searchParams: URLSearchParams) {
  const rawLimit = Number(searchParams.get('limit') ?? 20)
  const rawOffset = Number(searchParams.get('offset') ?? 0)

  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 40) : 20
  const offset = Number.isFinite(rawOffset) ? Math.max(Math.floor(rawOffset), 0) : 0

  return { limit, offset }
}
