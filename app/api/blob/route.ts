import { NextRequest } from 'next/server'

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

/**
 * Proxies audio from private blob storage so the browser can play it.
 * Fetches with the blob token and returns audio bytes with correct headers.
 */
export async function GET(request: NextRequest) {
  const blobUrl = request.nextUrl.searchParams.get('url')

  if (!blobUrl) {
    return new Response('url parameter required', { status: 400 })
  }

  try {
    // Fetch directly from blob storage with auth token
    const audioRes = await fetch(blobUrl, {
      headers: {
        'Authorization': `Bearer ${BLOB_TOKEN}`,
      },
    })

    if (!audioRes.ok) {
      console.error('Blob fetch failed:', audioRes.status, await audioRes.text())
      return new Response('Failed to fetch audio', { status: 502 })
    }

    const audioBuffer = await audioRes.arrayBuffer()

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.byteLength),
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes',
      },
    })
  } catch (err: any) {
    console.error('Blob proxy error:', err)
    return new Response('Failed to proxy audio', { status: 500 })
  }
}
