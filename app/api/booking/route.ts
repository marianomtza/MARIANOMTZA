import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../lib/supabase'
import { applyRateLimit } from '../../lib/rateLimit'
import { validateBookingPayload } from '../../lib/validation'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const rateLimit = applyRateLimit(`booking:${ip}`, { limit: 8, windowMs: 60_000 })

    if (!rateLimit.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = validateBookingPayload(body)

    if (parsed.ok === false) {
      return NextResponse.json({ error: parsed.error }, { status: 422 })
    }

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('bookings')
      .insert(parsed.data)
      .select('id,created_at')
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, booking: data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
