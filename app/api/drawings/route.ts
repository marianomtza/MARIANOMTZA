import { NextRequest, NextResponse } from 'next/server'
import { Drawing } from '../../lib/types'
import { createSupabaseServerClient, hasServerSupabaseEnv } from '../../lib/supabase'
import { checkRateLimit, getClientIp } from '../../lib/rateLimit'
import {
  ValidationError,
  getSafePagination,
  validateDrawingPayload,
} from '../../lib/validation'

const DRAWING_RATE_LIMIT = 15
const LOCAL_KEY = 'mmtza-local-drawings'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { limit, offset } = getSafePagination(searchParams)

    if (!hasServerSupabaseEnv()) {
      return NextResponse.json(
        { drawings: [], source: 'local-fallback', storageKey: LOCAL_KEY },
        { status: 200 }
      )
    }

    const supabase = createSupabaseServerClient()

    let result: any = await supabase
      .from('drawings')
      .select('id,image,name,message,tool,status,created_at,updated_at')
      .eq('status', 'public')
      .order('created_at', { ascending: false })
      .range(offset, Math.max(offset + limit - 1, 0))

    if (result.error && String(result.error.message || '').includes('status')) {
      result = await supabase
        .from('drawings')
        .select('id,image,name,message,tool,created_at,updated_at')
        .order('created_at', { ascending: false })
        .range(offset, Math.max(offset + limit - 1, 0))
    }

    const { data, error } = result

    if (error) throw error

    return NextResponse.json(
      { drawings: (data || []) as Drawing[], source: 'supabase' },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('GET /api/drawings error:', error)
    return NextResponse.json({ error: 'Failed to fetch drawings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rate = checkRateLimit(`drawings:${ip}`, DRAWING_RATE_LIMIT)

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

    const payload = validateDrawingPayload(parsedBody)

    if (!hasServerSupabaseEnv()) {
      return NextResponse.json(
        {
          error: 'Drawings API unavailable. Save locally.',
          fallback: 'local-storage',
          storageKey: LOCAL_KEY,
        },
        { status: 503 }
      )
    }

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('drawings')
      .insert(payload)
      .select('id,image,name,message,tool,status,created_at,updated_at')
      .single()

    if (error) throw error

    return NextResponse.json(data as Drawing, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('POST /api/drawings error:', error)
    return NextResponse.json({ error: 'Failed to save drawing' }, { status: 500 })
  }
}
