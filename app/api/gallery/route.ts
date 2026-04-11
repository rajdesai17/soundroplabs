import { NextRequest, NextResponse } from 'next/server'
import { mockGalleryData } from '@/lib/mockData'
import { Category } from '@/lib/types'
import { db, schema } from '@/lib/db'
import { eq, desc, sql, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category') as Category | null
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  // If no DATABASE_URL, fall back to mock data
  if (!process.env.DATABASE_URL) {
    let sounds = [...mockGalleryData]
    if (category && category !== 'All') {
      sounds = sounds.filter((s) => s.category === category)
    }
    const paginated = sounds.slice(offset, offset + limit)
    return NextResponse.json({
      sounds: paginated,
      total: sounds.length,
      hasMore: offset + limit < sounds.length,
    })
  }

  try {
    const conditions = [eq(schema.generationJobs.isPublic, true)]
    if (category && category !== 'All') {
      conditions.push(eq(schema.generationJobs.category, category))
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.generationJobs)
      .where(and(...conditions))

    const total = Number(countResult[0]?.count ?? 0)

    // Get jobs with their first variation for waveform/audio data
    const jobs = await db
      .select()
      .from(schema.generationJobs)
      .where(and(...conditions))
      .orderBy(desc(schema.generationJobs.createdAt))
      .limit(limit)
      .offset(offset)

    // For each job, get the first variation for waveform data
    const sounds = await Promise.all(
      jobs.map(async (job) => {
        const vars = await db
          .select()
          .from(schema.variations)
          .where(eq(schema.variations.jobId, job.id))
          .limit(1)

        const firstVar = vars[0]
        return {
          id: job.id,
          query: job.query,
          category: (job.category ?? 'All') as Category,
          duration: firstVar?.duration ?? job.duration ?? 5,
          playCount: job.playCount,
          waveformData: (firstVar?.waveformData as number[]) ?? [],
          createdAt: job.createdAt,
          audioUrl: firstVar?.audioUrl,
        }
      })
    )

    return NextResponse.json({
      sounds,
      total,
      hasMore: offset + limit < total,
    })
  } catch (err: any) {
    console.error('Gallery query error:', err)
    // Fall back to mock on DB error
    let sounds = [...mockGalleryData]
    if (category && category !== 'All') {
      sounds = sounds.filter((s) => s.category === category)
    }
    return NextResponse.json({
      sounds: sounds.slice(offset, offset + limit),
      total: sounds.length,
      hasMore: offset + limit < sounds.length,
    })
  }
}
