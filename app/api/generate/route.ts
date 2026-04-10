import { NextRequest, NextResponse } from 'next/server'
import { mockNeighbors, generateMockVariations } from '@/lib/mockData'

// Stub API that simulates the generation process
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

    // Simulate processing delay (~4 seconds)
    await new Promise((resolve) => setTimeout(resolve, 4000))

    // Return mock data
    const result = {
      query,
      duration: duration || null,
      neighbors: mockNeighbors,
      variations: generateMockVariations(),
      generationTime: 4.2,
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate sound' },
      { status: 500 }
    )
  }
}

// For streaming simulation (could be used for real-time stage updates)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json(
      { error: 'Query is required' },
      { status: 400 }
    )
  }

  // Create a streaming response for stage updates
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      const stages = [
        { stage: 0, message: 'Searching 50,000 sounds...' },
        { stage: 1, message: 'Found 8 acoustic neighbors...', neighbors: mockNeighbors },
        { stage: 2, message: 'Building generation prompt...' },
        { stage: 3, message: 'Generating 4 variations...' },
        { stage: 4, message: 'Complete', variations: generateMockVariations() },
      ]

      for (const stageData of stages) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(stageData)}\n\n`))
      }

      controller.close()
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
