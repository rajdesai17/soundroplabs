import { NextRequest, NextResponse } from 'next/server'
import { getDownloadUrl } from '@vercel/blob'

/**
 * Generates a temporary signed download URL for a private blob.
 * The client calls this with the blob URL to get a playable audio URL.
 */
export async function GET(request: NextRequest) {
  const blobUrl = request.nextUrl.searchParams.get('url')

  if (!blobUrl) {
    return NextResponse.json({ error: 'url parameter is required' }, { status: 400 })
  }

  try {
    const downloadUrl = await getDownloadUrl(blobUrl)
    return NextResponse.json({ downloadUrl })
  } catch (err: any) {
    console.error('Blob download URL error:', err)
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 })
  }
}
