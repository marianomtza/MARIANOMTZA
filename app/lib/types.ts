// ─── Drawing ──────────────────────────────────────────────────────────────────

export type DrawingTool = 'pencil' | 'marker' | 'ink' | 'eraser'

export interface Drawing {
  id: string
  /** thumb WebP as base64 data URL (primary display / legacy fallback) */
  image: string
  /** full-res WebP URL from Supabase Storage (optional) */
  image_url?: string
  /** thumb WebP URL from Supabase Storage (optional) */
  thumb_url?: string
  name: string
  message: string
  tool: DrawingTool
  status?: 'public' | 'pending' | 'hidden'
  /** saved locally but not yet synced to server */
  pending_sync?: boolean
  created_at: string
  updated_at?: string
}

export interface PendingDrawing {
  localId: string
  fullB64: string  // base64-encoded full WebP (no data: prefix)
  thumbB64: string // base64-encoded thumb WebP (no data: prefix)
  name: string
  message: string
  tool: DrawingTool
  timestamp: number
}

export interface DraftStroke {
  points: Array<{ x: number; y: number }>
  color: string
  size: number
  tool: DrawingTool
  opacity: number
}

export interface DraftData {
  strokes: DraftStroke[]
  color: string
  tool: DrawingTool
  size: number
  savedAt: number
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export interface BookingPayload {
  name: string
  email: string
  artist: string
  date: string
  city: string
  venue: string
  capacity: string
  event_type: string
  event_name: string
  budget: string
  notes: string
}
