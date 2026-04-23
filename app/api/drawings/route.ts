import { NextRequest, NextResponse } from 'next/server'
import { Drawing } from '../../lib/types'
import { createSupabaseServerClient } from '../../lib/supabase'
import { applyRateLimit } from '../../lib/rateLimit'
import { parsePagination, validateDrawingPayload } from '../../lib/validation'

function getClientKey(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
  const ua = request.headers.get('user-agent') || 'unknown-ua'
  return `${ip}:${ua.slice(0, 120)}`
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const { limit, offset } = parsePagination(searchParams)

    const { data, error } = await supabase
      .from('drawings')
      .select('id,image,name,message,tool,created_at,updated_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json((data || []) as Drawing[], {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('GET /api/drawings error:', error)
    return NextResponse.json({ error: 'Failed to fetch drawings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const key = getClientKey(request)
    const rateLimit = applyRateLimit(`drawings:${key}`, { limit: 12, windowMs: 60_000 })

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

    const supabase = createSupabaseServerClient()

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = validateDrawingPayload(body)

    if (parsed.ok === false) {
      return NextResponse.json({ error: parsed.error }, { status: 422 })
    }

    const { data, error } = await supabase
      .from('drawings')
      .insert(parsed.data)
      .select('id,image,name,message,tool,created_at,updated_at')
      .single()

    if (error) throw error

    return NextResponse.json(data as Drawing, { status: 201 })
  } catch (error) {
    console.error('POST /api/drawings error:', error)
    return NextResponse.json({ error: 'Failed to save drawing' }, { status: 500 })
  }
}
