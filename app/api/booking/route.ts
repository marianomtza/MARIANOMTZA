import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, hasServerSupabaseEnv } from '../../lib/supabase'
import { checkRateLimit, getClientIp } from '../../lib/rateLimit'
import { ValidationError, validateBookingPayload } from '../../lib/validation'

const BOOKING_RATE_LIMIT = 8

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rate = checkRateLimit(`booking:${ip}`, BOOKING_RATE_LIMIT)

    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many requests, try again later.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
      )
    }

    let parsedBody: unknown
    try {
      parsedBody = await request.json()
    } catch {
      throw new ValidationError('Invalid JSON body', 400)
    }

    const payload = validateBookingPayload(parsedBody)

    if (!hasServerSupabaseEnv()) {
      return NextResponse.json(
        { error: 'Booking service unavailable. Missing backend configuration.' },
        { status: 503 }
      )
    }

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('bookings')
      .insert(payload)
      .select('id,created_at')
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, booking: data }, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('POST /api/booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
