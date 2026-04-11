import { NextRequest } from 'next/server'
import { generateText } from 'ai'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const { query, neighbors } = await req.json()

    if (!query) {
      return Response.json({ error: 'query required' }, { status: 400 })
    }

    // Step 1: Build a music prompt using the same AI model already in our stack
    const { text: musicPrompt } = await generateText({
      model: 'google/gemini-2.0-flash' as any,
      prompt: `You are a film score composer. Based on this sound effect description and acoustic context, write a music prompt for an AI music generator.

Sound effect: "${query}"
Related sounds: ${neighbors?.slice(0, 5).map((n: { title: string }) => n.title).join(', ') ?? ''}

Write a single sentence (max 180 characters) describing an INSTRUMENTAL ambient music bed that complements this sound effect in a film or game scene.

Rules:
- NO artist names, band names, or song titles — causes copyright errors
- Describe only mood, tempo feel, instrumentation, and atmosphere
- Must be purely instrumental, no vocals described
- Think: 30-second ambient underscore, not a full song

Examples of correct output:
"Dark orchestral ambient, low cello drones, sparse piano, slow and ominous"
"Tense minimalist synth pad, building unease, cinematic underscore"
"Warm acoustic guitar, gentle and nostalgic, soft background ambience"

Return ONLY the prompt text. No quotes, no preamble, no explanation.`,
    })

    // Step 2: Call ElevenLabs Music Stream API
    const response = await fetch('https://api.elevenlabs.io/v1/music/stream', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: musicPrompt.trim().slice(0, 200),
        music_length_ms: 30000,
        force_instrumental: true,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('ElevenLabs Music API error:', response.status, err)
      return Response.json({ error: 'Music generation failed' }, { status: 502 })
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer())

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="music-bed.mp3"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('Music generation error:', err)
    return Response.json({ error: 'Music generation failed' }, { status: 500 })
  }
}
