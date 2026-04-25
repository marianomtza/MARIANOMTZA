import { NextRequest, NextResponse } from 'next/server'

// ─── Rate limiting (in-process) ───────────────────────────────────────────────
const rateMap = new Map<string, { n: number; reset: number }>()
const RATE_LIMIT  = 5
const RATE_WINDOW = 60_000

function checkRate(ip: string): boolean {
  const now = Date.now()
  const rec = rateMap.get(ip)
  if (!rec || now > rec.reset) {
    rateMap.set(ip, { n: 1, reset: now + RATE_WINDOW })
    return true
  }
  if (rec.n >= RATE_LIMIT) return false
  rec.n++
  return true
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'anon'
  )
}

function sanitize(s: string, max: number): string {
  return s.replace(/<[^>]*>/g, '').trim().slice(0, max)
}

function isSupabaseConfigured(): boolean {
  return !!(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit  = Math.min(parseInt(searchParams.get('limit')  || '24'), 50)
  const offset = Math.max(parseInt(searchParams.get('offset') || '0'),  0)

  if (!isSupabaseConfigured()) {
    return NextResponse.json([], {
      headers: { 'Cache-Control': 'public, max-age=60' },
    })
  }

  try {
    const { createSupabaseServerClient } = await import('../../lib/supabase')
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from('drawings')
      .select('id,image,image_url,thumb_url,name,message,tool,created_at')
      .eq('status', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json(data ?? [], {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (err) {
    console.error('[GET /api/drawings]', (err as Error)?.message)
    return NextResponse.json([], { status: 200 }) // degrade gracefully
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

const THUMB_MAX_BYTES = 512  * 1024 // 500 KB
const FULL_MAX_BYTES  = 1536 * 1024 // 1.5 MB

const VALID_TOOLS = new Set(['pencil', 'marker', 'ink', 'eraser'])

/** Strict: only image/webp. Reject SVG, HTML, and any other MIME. */
function isValidWebp(file: File): boolean {
  const t = file.type.toLowerCase()
  if (t !== 'image/webp') return false
  // Extra: reject by filename extension too
  const name = (file.name ?? '').toLowerCase()
  if (name.endsWith('.svg') || name.endsWith('.html') || name.endsWith('.htm')) return false
  return true
}

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = getIp(request)
  if (!checkRate(ip)) {
    return NextResponse.json(
      { error: 'Demasiados envíos. Espera un minuto.' },
      { status: 429 },
    )
  }

  // No Supabase → tell client to save locally
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Persistencia no configurada.' },
      { status: 503 },
    )
  }

  try {
    let form: FormData
    try {
      form = await request.formData()
    } catch {
      return NextResponse.json({ error: 'Multipart inválido.' }, { status: 400 })
    }

    // Honeypot
    if (form.get('website')) {
      return NextResponse.json({ error: 'Bad request.' }, { status: 400 })
    }

    const thumbFile = form.get('thumb') as File | null
    const fullFile  = form.get('full')  as File | null

    if (!thumbFile) {
      return NextResponse.json({ error: 'Falta el thumbnail.' }, { status: 400 })
    }

    // MIME check — must be exactly image/webp; no SVG, HTML, or other types
    if (!isValidWebp(thumbFile)) {
      return NextResponse.json({ error: 'Solo se aceptan imágenes WebP.' }, { status: 400 })
    }
    if (fullFile && !isValidWebp(fullFile)) {
      return NextResponse.json({ error: 'Solo se aceptan imágenes WebP.' }, { status: 400 })
    }

    // Tool whitelist
    const rawTool = String(form.get('tool') || 'pencil').toLowerCase()
    if (!VALID_TOOLS.has(rawTool)) {
      return NextResponse.json({ error: 'Tool inválido.' }, { status: 400 })
    }
    const tool = rawTool

    // Size limits
    if (thumbFile.size > THUMB_MAX_BYTES) {
      return NextResponse.json({ error: 'Thumbnail muy grande (max 500 KB).' }, { status: 413 })
    }
    if (fullFile && fullFile.size > FULL_MAX_BYTES) {
      return NextResponse.json({ error: 'Imagen muy grande (max 1.5 MB).' }, { status: 413 })
    }

    const name    = sanitize(String(form.get('name')    || 'Anónimo'), 60)
    const message = sanitize(String(form.get('message') || ''),       200)
    // tool already validated above

    // Convert thumb to base64 for DB storage
    const thumbBytes  = await thumbFile.arrayBuffer()
    const thumbBase64 = `data:image/webp;base64,${Buffer.from(thumbBytes).toString('base64')}`

    const { createSupabaseServerClient } = await import('../../lib/supabase')
    const supabase = createSupabaseServerClient()

    // ── Try Supabase Storage for full + thumb URLs (optional) ──────────────
    let imageUrl: string | undefined
    let thumbUrl: string | undefined

    const fileId = `${Date.now()}-${Math.random().toString(36).slice(2)}`

    if (fullFile) {
      const fullBytes = await fullFile.arrayBuffer()
      const { data: upFull, error: upFullErr } = await supabase.storage
        .from('drawings')
        .upload(`full/${fileId}.webp`, fullBytes, {
          contentType: 'image/webp',
          upsert: false,
        })
      if (!upFullErr && upFull) {
        const { data: pub } = supabase.storage
          .from('drawings')
          .getPublicUrl(`full/${fileId}.webp`)
        imageUrl = pub.publicUrl
      }

      // Also upload thumb to storage
      const { data: upThumb, error: upThumbErr } = await supabase.storage
        .from('drawings')
        .upload(`thumb/${fileId}.webp`, thumbBytes, {
          contentType: 'image/webp',
          upsert: false,
        })
      if (!upThumbErr && upThumb) {
        const { data: pub } = supabase.storage
          .from('drawings')
          .getPublicUrl(`thumb/${fileId}.webp`)
        thumbUrl = pub.publicUrl
      }
    }

    // ── Insert into DB ──────────────────────────────────────────────────────
    const { data, error } = await supabase
      .from('drawings')
      .insert({
        image:     thumbBase64,   // base64 thumb (display fallback)
        image_url: imageUrl,
        thumb_url: thumbUrl,
        name,
        message,
        tool,
        status: 'public',
      })
      .select('id,image,image_url,thumb_url,name,message,tool,created_at')
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[POST /api/drawings]', (err as Error)?.message)
    return NextResponse.json(
      { error: 'Error guardando el dibujo.' },
      { status: 500 },
    )
  }
}
