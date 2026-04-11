import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'
import { generateText } from 'ai'
import { embedQuery } from '@/lib/embeddings'
import { queryNeighbors } from '@/lib/turbopuffer'
import { enrichPrompt } from '@/lib/claude'
import { generateSoundEffect } from '@/lib/elevenlabs'
import { extractWaveformFromBuffer } from '@/lib/waveform-extract'
import { decomposeScene } from '@/lib/scene-decompose'
import { mockSceneDecomposition, generateMockSceneLayers } from '@/lib/mockData'
import { db, schema } from '@/lib/db'
import type { SceneLayerSpec, LayerType } from '@/lib/scene-types'
import type { Neighbor } from '@/lib/types'

export const maxDuration = 120

function isMockMode(): boolean {
  return (
    !process.env.TURBOPUFFER_API_KEY ||
    !process.env.ELEVENLABS_API_KEY ||
    !process.env.AI_GATEWAY_API_KEY ||
    !process.env.BLOB_READ_WRITE_TOKEN ||
    !process.env.HF_API_TOKEN
  )
}

interface LayerPipelineResult {
  layerType: LayerType
  audioUrl: string
  waveformData: number[]
  duration: number
  enrichedPrompt: string
  neighbors: Neighbor[]
}

async function processSfxLayer(
  layer: SceneLayerSpec,
  sceneId: string,
  send: (data: Record<string, unknown>) => void,
): Promise<LayerPipelineResult> {
  const { type: layerType, query } = layer
  send({ type: 'layer-start', layerType, message: `Embedding ${layerType} layer...` })

  const embedding = await embedQuery(query)

  const tpStart = Date.now()
  const neighbors = await queryNeighbors(embedding, 8)
  const tpLatencyMs = Date.now() - tpStart
  send({ type: 'layer-neighbors', layerType, neighbors, latencyMs: tpLatencyMs })

  const enrichedPrompt = await enrichPrompt(query, neighbors, 10)

  const buffer = await generateSoundEffect(enrichedPrompt, 10)
  const waveformData = extractWaveformFromBuffer(buffer)

  const blob = await put(
    `scenes/${sceneId}/${layerType}.mp3`,
    buffer,
    { access: 'private', contentType: 'audio/mpeg' }
  )

  const duration = estimateDuration(buffer)
  send({ type: 'layer-complete', layerType, audioUrl: blob.url, waveformData, duration })

  return { layerType, audioUrl: blob.url, waveformData, duration, enrichedPrompt, neighbors }
}

async function processMusicLayer(
  layer: SceneLayerSpec,
  sceneId: string,
  send: (data: Record<string, unknown>) => void,
): Promise<LayerPipelineResult> {
  const { type: layerType, query } = layer
  send({ type: 'layer-start', layerType, message: `Composing music layer...` })

  // Build a music-specific prompt via Gemini
  const { text: musicPrompt } = await generateText({
    model: 'google/gemini-2.0-flash' as any,
    prompt: `You are a film score composer. Write a music prompt for an AI music generator.

Scene context: "${query}"

Write a single sentence (max 180 characters) describing an INSTRUMENTAL ambient music bed.

Rules:
- NO artist names, band names, or song titles
- Describe only mood, tempo feel, instrumentation, and atmosphere
- Must be purely instrumental, no vocals
- Think: 30-second ambient underscore

Return ONLY the prompt text. No quotes, no preamble.`,
  })

  // Call ElevenLabs Music API
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
    throw new Error(`ElevenLabs Music API error (${response.status}): ${err}`)
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer())
  const waveformData = extractWaveformFromBuffer(audioBuffer)

  const blob = await put(
    `scenes/${sceneId}/music.mp3`,
    audioBuffer,
    { access: 'private', contentType: 'audio/mpeg' }
  )

  send({ type: 'layer-complete', layerType, audioUrl: blob.url, waveformData, duration: 30 })

  return { layerType, audioUrl: blob.url, waveformData, duration: 30, enrichedPrompt: musicPrompt, neighbors: [] }
}

async function persistScene(
  sceneId: string,
  description: string,
  layers: SceneLayerSpec[],
  results: PromiseSettledResult<LayerPipelineResult>[]
) {
  if (!process.env.DATABASE_URL) return

  try {
    await db.insert(schema.scenes).values({
      id: sceneId,
      description,
      isPublic: true,
    })

    await Promise.all(
      layers.map((layer, i) => {
        const result = results[i]
        const isOk = result.status === 'fulfilled'
        const data = isOk ? result.value : null

        return db.insert(schema.sceneLayers).values({
          sceneId,
          layerType: layer.type,
          query: layer.query,
          enrichedPrompt: data?.enrichedPrompt ?? null,
          neighbors: (data?.neighbors ?? []) as any,
          audioUrl: data?.audioUrl ?? null,
          waveformData: (data?.waveformData ?? []) as any,
          duration: data?.duration ?? null,
          status: isOk ? 'complete' : 'error',
          errorMessage: isOk ? null : (result as PromiseRejectedResult).reason?.message ?? 'Unknown error',
        })
      })
    )
  } catch (err) {
    console.error('Failed to persist scene to DB:', err)
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function estimateDuration(buffer: Buffer): number {
  const bitrate = 128000
  const durationSec = (buffer.length * 8) / bitrate
  return Math.round(durationSec * 10) / 10
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const description = body.description?.trim()

  if (!description) {
    return Response.json({ error: 'Scene description is required' }, { status: 400 })
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
          // Mock mode
          send({ type: 'decomposition', layers: mockSceneDecomposition })
          await delay(500)

          const mockLayers = generateMockSceneLayers()
          for (const layer of mockLayers) {
            send({ type: 'layer-start', layerType: layer.type, message: `Processing ${layer.type}...` })
            await delay(300)
            send({
              type: 'layer-complete',
              layerType: layer.type,
              audioUrl: layer.audioUrl,
              waveformData: layer.waveformData,
              duration: layer.duration,
            })
            await delay(200)
          }

          send({ type: 'complete', sceneId: `scene-mock-${Date.now()}` })
        } else {
          // Real mode

          // Step 1: Decompose scene via Gemini
          let layers: SceneLayerSpec[]
          try {
            layers = await decomposeScene(description)
          } catch (err: any) {
            // Retry once on decomposition failure
            console.error('Decomposition failed, retrying:', err.message)
            try {
              layers = await decomposeScene(description)
            } catch (retryErr: any) {
              send({ type: 'error', message: 'Could not decompose scene. Try rephrasing your description.' })
              controller.close()
              return
            }
          }

          send({ type: 'decomposition', layers })

          // Step 2: Run 4 pipelines concurrently
          const sceneId = `scene-${Date.now()}`

          const results = await Promise.allSettled(
            layers.map(layer => {
              if (layer.type === 'music') {
                return processMusicLayer(layer, sceneId, send)
              }
              return processSfxLayer(layer, sceneId, send)
            })
          )

          // Emit errors for failed layers
          for (let i = 0; i < results.length; i++) {
            if (results[i].status === 'rejected') {
              const reason = (results[i] as PromiseRejectedResult).reason
              send({
                type: 'layer-error',
                layerType: layers[i].type,
                message: reason?.message || 'Generation failed',
              })
            }
          }

          // Step 3: Persist (non-blocking)
          persistScene(sceneId, description, layers, results).catch(console.error)

          // Step 4: Done
          send({ type: 'complete', sceneId })
        }
      } catch (err: any) {
        console.error('Scene pipeline error:', err)
        send({ type: 'error', message: err.message || 'Scene generation failed' })
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
