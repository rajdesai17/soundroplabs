import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const jobs = await db
      .select()
      .from(schema.generationJobs)
      .where(eq(schema.generationJobs.id, id))
      .limit(1)

    if (jobs.length === 0) {
      return NextResponse.json({ error: 'Sound not found' }, { status: 404 })
    }

    const job = jobs[0]

    const vars = await db
      .select()
      .from(schema.variations)
      .where(eq(schema.variations.jobId, id))

    return NextResponse.json({
      id: job.id,
      query: job.query,
      enrichedPrompt: job.enrichedPrompt,
      duration: job.duration,
      category: job.category,
      playCount: job.playCount,
      neighbors: job.neighbors,
      createdAt: job.createdAt,
      variations: vars.map((v) => ({
        id: v.id,
        index: v.variationIndex,
        audioUrl: v.audioUrl,
        waveformData: v.waveformData,
        duration: v.duration,
      })),
    })
  } catch (err: any) {
    console.error('Sound permalink error:', err)
    return NextResponse.json({ error: 'Failed to fetch sound' }, { status: 500 })
  }
}
