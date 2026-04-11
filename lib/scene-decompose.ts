import { generateText } from 'ai'
import { SceneLayerSpec, LayerType, LAYER_TYPES } from './scene-types'

const SYSTEM_PROMPT = `You are a professional sound designer. Given a scene description, decompose it into exactly 4 sonic layers for audio generation.

Return ONLY a JSON array with exactly 4 objects. Each object must have:
- "type": one of "ambience", "foreground", "background", "music"
- "query": a detailed, standalone sound description (30-60 words) optimized for an AI sound effects generator. Include acoustic details: texture, material, space, distance, resonance.
- "reasoning": a brief explanation (1 sentence) of why this layer fits the scene.

Rules:
- Each type must appear exactly once
- The "music" layer should describe an instrumental mood/score (no vocals, no artist names)
- The other 3 layers should describe concrete sound effects
- Output raw JSON only — no markdown, no code fences, no preamble`

export async function decomposeScene(description: string): Promise<SceneLayerSpec[]> {
  const { text } = await generateText({
    model: 'google/gemini-2.0-flash' as any,
    system: SYSTEM_PROMPT,
    prompt: `Scene: "${description}"

Decompose this scene into 4 sonic layers (ambience, foreground, background, music). Return JSON array only.`,
  } as any)

  return parseDecomposition(text)
}

function parseDecomposition(raw: string): SceneLayerSpec[] {
  // Strip markdown code fences if present
  let cleaned = raw.trim()
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')

  let parsed: any[]
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('Scene decomposition returned invalid JSON')
  }

  if (!Array.isArray(parsed) || parsed.length !== 4) {
    throw new Error(`Expected 4 layers, got ${Array.isArray(parsed) ? parsed.length : 'non-array'}`)
  }

  const seen = new Set<string>()
  const layers: SceneLayerSpec[] = []

  for (const item of parsed) {
    const type = item.type as LayerType
    if (!LAYER_TYPES.includes(type)) {
      throw new Error(`Invalid layer type: ${type}`)
    }
    if (seen.has(type)) {
      throw new Error(`Duplicate layer type: ${type}`)
    }
    if (!item.query || typeof item.query !== 'string') {
      throw new Error(`Missing or invalid query for layer: ${type}`)
    }
    seen.add(type)
    layers.push({
      type,
      query: item.query,
      reasoning: item.reasoning || '',
    })
  }

  return layers
}
