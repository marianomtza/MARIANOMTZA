import { NextRequest, NextResponse } from 'next/server'
import { Drawing } from '../../lib/types'
import { createSupabaseServerClient } from '../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data, error } = await supabase
      .from('drawings')
      .select('id,image,name,message,tool,created_at,updated_at')
      .order('created_at', { ascending: false })
      .range(offset, Math.max(offset + limit - 1, 0))

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
    const supabase = createSupabaseServerClient()
    const body = await request.json()

    // Validate
    if (!body.image || typeof body.image !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid image' }, { status: 400 })
    }

    const payload = {
      image: body.image,
      name: body.name || 'Anónimo',
      message: body.message || '',
      tool: body.tool || 'pencil',
    }

    const { data, error } = await supabase
      .from('drawings')
      .insert(payload)
      .select('id,image,name,message,tool,created_at,updated_at')
      .single()

    if (error) throw error

    return NextResponse.json(data as Drawing, { status: 201 })
  } catch (error) {
    console.error('POST /api/drawings error:', error)
    return NextResponse.json({ error: 'Failed to save drawing' }, { status: 500 })
  }
}
