import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db, schema } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

// In-memory fallback for when DATABASE_URL is not set
const savedSounds: Map<string, object> = new Map()

async function getSessionUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    return (session?.user as any)?.id ?? null
  } catch {
    return null
  }
}

export async function GET() {
  if (!process.env.DATABASE_URL) {
    const sounds = Array.from(savedSounds.values())
    return NextResponse.json({ sounds, total: sounds.length })
  }

  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const entries = await db
      .select({
        id: schema.libraryEntries.id,
        savedAt: schema.libraryEntries.savedAt,
        variationId: schema.variations.id,
        audioUrl: schema.variations.audioUrl,
        duration: schema.variations.duration,
        waveformData: schema.variations.waveformData,
        variationIndex: schema.variations.variationIndex,
        jobId: schema.generationJobs.id,
        query: schema.generationJobs.query,
        category: schema.generationJobs.category,
        playCount: schema.generationJobs.playCount,
      })
      .from(schema.libraryEntries)
      .innerJoin(schema.variations, eq(schema.libraryEntries.variationId, schema.variations.id))
      .innerJoin(schema.generationJobs, eq(schema.variations.jobId, schema.generationJobs.id))
      .where(eq(schema.libraryEntries.userId, userId))

    const sounds = entries.map((e) => ({
      id: String(e.id),
      query: e.query,
      category: e.category ?? 'All',
      duration: e.duration ?? 5,
      playCount: e.playCount,
      waveformData: (e.waveformData as number[]) ?? [],
      createdAt: e.savedAt,
      savedAt: e.savedAt,
      audioUrl: e.audioUrl,
      variationId: e.variationId,
    }))

    return NextResponse.json({ sounds, total: sounds.length })
  } catch (err: any) {
    console.error('Library GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!process.env.DATABASE_URL) {
    const soundWithTimestamp = { ...body, savedAt: new Date().toISOString() }
    savedSounds.set(body.id, soundWithTimestamp)
    return NextResponse.json({ success: true, sound: soundWithTimestamp })
  }

  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const variationId = body.variationId || body.id
  if (!variationId) {
    return NextResponse.json({ error: 'Variation ID is required' }, { status: 400 })
  }

  try {
    await db.insert(schema.libraryEntries).values({
      userId,
      variationId,
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Library POST error:', err)
    return NextResponse.json({ error: 'Failed to save sound' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  if (!process.env.DATABASE_URL) {
    savedSounds.delete(id)
    return NextResponse.json({ success: true })
  }

  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await db
      .delete(schema.libraryEntries)
      .where(
        and(
          eq(schema.libraryEntries.id, parseInt(id)),
          eq(schema.libraryEntries.userId, userId)
        )
      )
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Library DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete sound' }, { status: 500 })
  }
}
