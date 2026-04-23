import { NextRequest, NextResponse } from 'next/server'
import { Drawing } from '../../lib/types'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

// In-memory storage with file fallback
let drawings: Drawing[] = []

// Load from file on startup
function loadDrawings() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'drawings.json')
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      drawings = JSON.parse(data)
    }
  } catch (error) {
    console.error('Failed to load drawings:', error)
    drawings = []
  }
}

// Save to file
function saveDrawings() {
  try {
    const dirPath = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    const filePath = path.join(dirPath, 'drawings.json')
    fs.writeFileSync(filePath, JSON.stringify(drawings, null, 2))
  } catch (error) {
    console.error('Failed to save drawings:', error)
  }
}

// Load on module import
loadDrawings()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const paginated = drawings.slice(offset, offset + limit)

    return NextResponse.json(paginated, {
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
    const body = await request.json()

    // Validate
    if (!body.image || typeof body.image !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid image' }, { status: 400 })
    }

    const newDrawing: Drawing = {
      id: crypto.randomUUID(),
      image: body.image,
      name: body.name || 'Anónimo',
      message: body.message || '',
      tool: body.tool || 'pencil',
      created_at: new Date().toISOString(),
    }

    drawings.unshift(newDrawing)
    saveDrawings()

    return NextResponse.json(newDrawing, { status: 201 })
  } catch (error) {
    console.error('POST /api/drawings error:', error)
    return NextResponse.json({ error: 'Failed to save drawing' }, { status: 500 })
  }
}
