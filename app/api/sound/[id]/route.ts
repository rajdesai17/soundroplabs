import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { mockGalleryData, generateMockVariations, mockNeighbors } from '@/lib/mockData'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Try DB first
  if (process.env.DATABASE_URL) {
    try {
      const jobs = await db
        .select()
        .from(schema.generationJobs)
        .where(eq(schema.generationJobs.id, id))
        .limit(1)

      if (jobs.length > 0) {
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
      }
    } catch (err: any) {
      console.error('Sound permalink DB error:', err.message)
      // Fall through to mock fallback
    }
  }

  // Mock fallback — find by ID in mock gallery data
  const mockSound = mockGalleryData.find((s) => s.id === id)
  if (mockSound) {
    return NextResponse.json({
      id: mockSound.id,
      query: mockSound.query,
      enrichedPrompt: `Enhanced: ${mockSound.query}`,
      duration: mockSound.duration,
      category: mockSound.category,
      playCount: mockSound.playCount,
      neighbors: mockNeighbors,
      createdAt: mockSound.createdAt,
      variations: generateMockVariations(),
    })
  }

  return NextResponse.json({ error: 'Sound not found' }, { status: 404 })
}
