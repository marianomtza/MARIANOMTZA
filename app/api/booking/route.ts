import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../lib/supabase'
import { BookingPayload } from '../../lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<BookingPayload>

    if (!body.name || !body.email || !body.date || !body.city) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const payload: BookingPayload = {
      name: body.name.trim(),
      email: body.email.trim(),
      artist: (body.artist || '').trim(),
      date: body.date.trim(),
      city: body.city.trim(),
      venue: (body.venue || '').trim(),
      capacity: (body.capacity || '').trim(),
      event_type: (body.event_type || '').trim(),
      event_name: (body.event_name || '').trim(),
      budget: (body.budget || '').trim(),
      notes: (body.notes || '').trim(),
    }

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.from('bookings').insert(payload).select('id,created_at').single()

    if (error) throw error

    return NextResponse.json({ ok: true, booking: data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
