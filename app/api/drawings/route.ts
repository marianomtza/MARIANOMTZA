import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { Drawing } from '../../lib/types'
import { createSupabaseServerClient, hasServerSupabaseEnv } from '../../lib/supabase'
import { checkRateLimit, getClientIp } from '../../lib/rateLimit'
import {
  ValidationError,
  getSafePagination,
  sanitizeDrawingText,
  validateDrawingPayload,
} from '../../lib/validation'

const DRAWING_RATE_LIMIT = 15
const LOCAL_KEY = 'mmtza-local-drawings'
const DRAWING_BUCKET = process.env.SUPABASE_DRAWINGS_BUCKET || 'drawings-wall'

function publicDrawing(row: Record<string, unknown>): Drawing {
  const imageUrl = (row.image_url as string | undefined) || (row.image as string | undefined) || ''
  const thumb = (row.thumb_url as string | undefined) || imageUrl

  return {
    id: String(row.id),
    image: imageUrl,
    image_url: imageUrl,
    thumb_url: thumb,
    full_url: imageUrl,
    name: (row.name as string) || 'Anónimo',
    message: (row.message as string) || '',
    tool: ((row.tool as Drawing['tool']) || 'pencil'),
    created_at: String(row.created_at || new Date().toISOString()),
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  }
}

function hashValue(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

async function uploadAndGetPublicUrl(path: string, file: File, contentType = 'image/webp') {
  const supabase = createSupabaseServerClient()
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage.from(DRAWING_BUCKET).upload(path, arrayBuffer, {
    contentType,
    upsert: false,
  })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(DRAWING_BUCKET).getPublicUrl(path)
  if (!data?.publicUrl) {
    throw new Error('No se pudo generar URL pública')
  }

  return data.publicUrl
}

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
    const { data, error } = await supabase
      .from('drawings')
      .select('id,image,image_url,thumb_url,name,message,tool,status,created_at,updated_at')
      .eq('status', 'public')
      .order('created_at', { ascending: false })
      .range(offset, Math.max(offset + limit - 1, 0))

    if (error) throw error

    return NextResponse.json(
      {
        drawings: (data || []).map((row) => publicDrawing(row as Record<string, unknown>)),
        source: 'supabase',
        nextOffset: (data?.length || 0) >= limit ? offset + limit : null,
      },
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

    console.error('GET /api/drawings error')
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

    if (!hasServerSupabaseEnv()) {
      return NextResponse.json(
        {
          error: 'Storage backend unavailable. Save locally.',
          fallback: 'local-storage',
          storageKey: LOCAL_KEY,
        },
        { status: 503 }
      )
    }

    const contentType = request.headers.get('content-type') || ''

    let name = 'Anónimo'
    let message = ''
    let tool: Drawing['tool'] = 'pencil'
    let imageUrl = ''
    let thumbUrl = ''

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const honeypot = String(form.get('website') || '')
      if (honeypot) {
        return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
      }

      name = sanitizeDrawingText(form.get('name'), 80) || 'Anónimo'
      message = sanitizeDrawingText(form.get('message'), 220)

      const rawTool = sanitizeDrawingText(form.get('tool'), 20) as Drawing['tool']
      if (rawTool && !['pencil', 'marker', 'ink', 'eraser'].includes(rawTool)) {
        throw new ValidationError('Invalid drawing tool', 422)
      }
      tool = rawTool || 'pencil'

      const full = form.get('full')
      const thumb = form.get('thumb')

      if (!(full instanceof File) || !(thumb instanceof File)) {
        throw new ValidationError('Missing drawing files', 400)
      }

      if (!['image/webp'].includes(full.type) || !['image/webp'].includes(thumb.type)) {
        throw new ValidationError('Only WEBP uploads are accepted', 422)
      }

      if (full.size > 1_400_000 || thumb.size > 500_000) {
        throw new ValidationError('Drawing file too large', 422)
      }

      const id = crypto.randomUUID()
      imageUrl = await uploadAndGetPublicUrl(`${id}/full.webp`, full)
      thumbUrl = await uploadAndGetPublicUrl(`${id}/thumb.webp`, thumb)
    } else if (contentType.includes('application/json')) {
      const parsedBody = await request.json().catch(() => {
        throw new ValidationError('Invalid JSON body', 400)
      })
      const payload = validateDrawingPayload(parsedBody)
      name = payload.name
      message = payload.message
      tool = payload.tool
      imageUrl = payload.image || ''
      thumbUrl = payload.image || ''
    } else {
      throw new ValidationError('Unsupported content-type', 400)
    }

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('drawings')
      .insert({
        image_url: imageUrl,
        image: imageUrl,
        thumb_url: thumbUrl,
        name,
        message,
        tool,
        status: 'public',
        source: 'web',
        ip_hash: hashValue(ip),
        user_agent_hash: hashValue(request.headers.get('user-agent') || 'unknown'),
      })
      .select('id,image,image_url,thumb_url,name,message,tool,created_at,updated_at')
      .single()

    if (error) throw error

    return NextResponse.json(publicDrawing(data as Record<string, unknown>), { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('POST /api/drawings error')
    return NextResponse.json({ error: 'Failed to save drawing' }, { status: 500 })
  }
}
