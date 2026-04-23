import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../lib/supabase'
import { applyRateLimit } from '../../lib/rateLimit'
import { validateBookingPayload } from '../../lib/validation'

function getClientKey(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
  const ua = request.headers.get('user-agent') || 'unknown-ua'
  return `${ip}:${ua.slice(0, 120)}`
}

export async function POST(request: NextRequest) {
  try {
    const key = getClientKey(request)
    const rateLimit = applyRateLimit(`booking:${key}`, { limit: 8, windowMs: 60_000 })

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimit.retryAfterMs / 1000) || 60),
          },
        }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

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
