import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { embedQuery } from '@/lib/embeddings'
import { queryNeighbors } from '@/lib/turbopuffer'
import { enrichPrompt } from '@/lib/claude'
import { generateVariations } from '@/lib/elevenlabs'
import { extractWaveformFromBuffer } from '@/lib/waveform-extract'
import { mockNeighbors, generateMockVariations } from '@/lib/mockData'
import { db, schema } from '@/lib/db'

// Allow up to 60s for the full pipeline
export const maxDuration = 60

function isMockMode(): boolean {
  // Fall back to mock mode if any required API key is missing
  return (
    !process.env.TURBOPUFFER_API_KEY ||
    !process.env.ELEVENLABS_API_KEY ||
    !process.env.AI_GATEWAY_API_KEY ||
    !process.env.BLOB_READ_WRITE_TOKEN
  )
}

async function persistToDb(
  jobId: string,
  query: string,
  enrichedPrompt: string,
  duration: number | null,
  neighbors: any[],
  variations: { id: string; index: number; audioUrl: string; waveformData: number[]; duration: number }[]
) {
  if (!process.env.DATABASE_URL) return

  try {
    // Insert generation job
    await db.insert(schema.generationJobs).values({
      id: jobId,
      query,
      enrichedPrompt,
      duration,
      neighbors: neighbors as any,
      category: 'All',
      isPublic: true,
    })

    // Insert variations
    await Promise.all(
      variations.map((v) =>
        db.insert(schema.variations).values({
          id: v.id,
          jobId,
          variationIndex: v.index,
          audioUrl: v.audioUrl,
          duration: v.duration,
          waveformData: v.waveformData as any,
        })
      )
    )
  } catch (err) {
    // Non-blocking — generation still succeeds even if DB write fails
    console.error('Failed to persist generation to DB:', err)
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  const durationParam = searchParams.get('duration')
  const duration = durationParam ? parseFloat(durationParam) : null

  if (!query) {
    return NextResponse.json(
      { error: 'Query is required' },
      { status: 400 }
    )
  }

  const encoder = new TextEncoder()
  const useMock = isMockMode()

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false
      const send = (data: Record<string, unknown>) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          closed = true
        }
      }

      try {
        if (useMock) {
          // Mock mode: same behavior as before for local dev without API keys
          send({ stage: 0, message: 'Searching 50,000 sounds...' })
          await delay(1000)
          send({ stage: 1, message: 'Found 8 acoustic neighbors...', neighbors: mockNeighbors })
          await delay(1000)
          send({ stage: 2, message: 'Building generation prompt...' })
          await delay(1000)
          send({ stage: 3, message: 'Generating 4 variations...' })
          await delay(1000)
          send({ stage: 4, message: 'Complete', variations: generateMockVariations() })
        } else {
          // --- Stage 0: Semantic search ---
          send({ stage: 0, message: 'Searching 50,000 sounds...' })

          const embedding = await embedQuery(query)
          const neighbors = await queryNeighbors(embedding, 8)

          // --- Stage 1: Neighbors found ---
          send({ stage: 1, message: `Found ${neighbors.length} acoustic neighbors...`, neighbors })

          // --- Stage 2: Prompt enrichment ---
          send({ stage: 2, message: 'Building generation prompt...' })

          const enrichedPrompt = await enrichPrompt(query, neighbors, duration)

          // --- Stage 3: Generate audio ---
          send({ stage: 3, message: 'Generating 4 variations...' })

          const audioBuffers = await generateVariations(enrichedPrompt, duration, 4)

          // Upload to Vercel Blob and extract waveforms
          const jobId = `job-${Date.now()}`
          const variations = await Promise.all(
            audioBuffers.map(async (buffer, i) => {
              const blob = await put(
                `sounds/${jobId}/variation-${i + 1}.mp3`,
                buffer,
                { access: 'private', contentType: 'audio/mpeg' }
              )

              const waveformData = extractWaveformFromBuffer(buffer)

              return {
                id: `var-${i + 1}-${Date.now()}`,
                index: i + 1,
                audioUrl: blob.url,
                waveformData,
                duration: duration ?? estimateDuration(buffer),
              }
            })
          )

          // Persist to database (non-blocking)
          await persistToDb(jobId, query, enrichedPrompt, duration, neighbors, variations)

          // --- Stage 4: Complete ---
          send({
            stage: 4,
            message: 'Complete',
            variations,
            enrichedPrompt,
            jobId,
          })
        }
      } catch (err: any) {
        console.error('Generation pipeline error:', err)
        send({
          stage: -1,
          message: `Error: ${err.message || 'Generation failed'}`,
          error: true,
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// Keep POST as a simple non-streaming fallback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, duration } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    if (isMockMode()) {
      await delay(4000)
      return NextResponse.json({
        query,
        duration: duration || null,
        neighbors: mockNeighbors,
        variations: generateMockVariations(),
        generationTime: 4.2,
      })
    }

    const startTime = Date.now()

    const embedding = await embedQuery(query)
    const neighbors = await queryNeighbors(embedding, 8)
    const enrichedPrompt = await enrichPrompt(query, neighbors, duration ?? null)
    const audioBuffers = await generateVariations(enrichedPrompt, duration ?? null, 4)

    const jobId = `job-${Date.now()}`
    const variations = await Promise.all(
      audioBuffers.map(async (buffer, i) => {
        const blob = await put(
          `sounds/${jobId}/variation-${i + 1}.mp3`,
          buffer,
          { access: 'private', contentType: 'audio/mpeg' }
        )
        return {
          id: `var-${i + 1}-${Date.now()}`,
          index: i + 1,
          audioUrl: blob.url,
          waveformData: extractWaveformFromBuffer(buffer),
          duration: duration ?? estimateDuration(buffer),
        }
      })
    )

    const generationTime = (Date.now() - startTime) / 1000

    // Persist to database (non-blocking)
    await persistToDb(jobId, query, enrichedPrompt, duration ?? null, neighbors, variations)

    return NextResponse.json({
      query,
      duration: duration || null,
      neighbors,
      variations,
      enrichedPrompt,
      generationTime,
      jobId,
    })
  } catch (err: any) {
    console.error('Generation error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to generate sound' },
      { status: 500 }
    )
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Rough MP3 duration estimate from buffer size.
 * Assumes ~128kbps bitrate. This is a fallback when duration isn't specified.
 */
function estimateDuration(buffer: Buffer): number {
  const bitrate = 128000 // bits per second
  const durationSec = (buffer.length * 8) / bitrate
  return Math.round(durationSec * 10) / 10
}
