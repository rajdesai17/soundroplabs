import { NextRequest, NextResponse } from 'next/server'
import { mockGalleryData } from '@/lib/mockData'
import { Category } from '@/lib/types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category') as Category | null
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Filter by category if provided
  let sounds = [...mockGalleryData]
  
  if (category && category !== 'All') {
    sounds = sounds.filter((sound) => sound.category === category)
  }

  // Apply pagination
  const paginatedSounds = sounds.slice(offset, offset + limit)

  return NextResponse.json({
    sounds: paginatedSounds,
    total: sounds.length,
    hasMore: offset + limit < sounds.length,
  })
}
