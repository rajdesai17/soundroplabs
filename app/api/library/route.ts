import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo (would be database in production)
const savedSounds: Map<string, object> = new Map()

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Return all saved sounds
  const sounds = Array.from(savedSounds.values())

  return NextResponse.json({
    sounds,
    total: sounds.length,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Sound ID is required' },
        { status: 400 }
      )
    }

    // Add timestamp
    const soundWithTimestamp = {
      ...body,
      savedAt: new Date().toISOString(),
    }

    // Save to "database"
    savedSounds.set(body.id, soundWithTimestamp)

    return NextResponse.json({
      success: true,
      sound: soundWithTimestamp,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to save sound' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'Sound ID is required' },
      { status: 400 }
    )
  }

  const deleted = savedSounds.delete(id)

  if (!deleted) {
    return NextResponse.json(
      { error: 'Sound not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
  })
}
