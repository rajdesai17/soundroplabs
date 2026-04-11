const API_KEY = process.env.ELEVENLABS_API_KEY
const BASE_URL = 'https://api.elevenlabs.io/v1/sound-generation'

export async function generateSoundEffect(
  prompt: string,
  duration: number | null
): Promise<Buffer> {
  // ElevenLabs SFX has a 450 char limit
  const truncatedPrompt = prompt.length > 440 ? prompt.slice(0, 440) + '...' : prompt
  const body: Record<string, unknown> = { text: truncatedPrompt }
  if (duration != null) {
    body.duration_seconds = duration
  }

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (res.status === 429) {
    throw new Error('RATE_LIMIT')
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`ElevenLabs SFX failed (${res.status}): ${text}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function generateVariations(
  prompt: string,
  duration: number | null,
  count: number = 4
): Promise<Buffer[]> {
  const results = await Promise.allSettled(
    Array.from({ length: count }, () => generateSoundEffect(prompt, duration))
  )

  const buffers: Buffer[] = []
  const retries: number[] = []

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (result.status === 'fulfilled') {
      buffers.push(result.value)
    } else if (result.reason?.message === 'RATE_LIMIT') {
      retries.push(i)
    } else {
      console.error(`Variation ${i + 1} failed:`, result.reason?.message)
    }
  }

  // Retry rate-limited calls sequentially
  if (retries.length > 0) {
    console.log(`Retrying ${retries.length} rate-limited variations...`)
    await sleep(2000)

    for (const idx of retries) {
      try {
        const buffer = await generateSoundEffect(prompt, duration)
        buffers.push(buffer)
      } catch (err: any) {
        console.error(`Retry for variation ${idx + 1} failed:`, err.message)
      }
    }
  }

  if (buffers.length === 0) {
    throw new Error('All ElevenLabs SFX generations failed')
  }

  return buffers
}
