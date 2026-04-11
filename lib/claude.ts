import { generateText } from 'ai'
import { Neighbor } from './types'

const SYSTEM_PROMPT = `You are an expert sound designer who creates detailed, vivid prompts for AI sound effects generators.

Given a user's sound description and semantically similar real sounds from a library, create an enhanced prompt that will produce the best possible AI-generated sound effect.

Guidelines:
- Include specific acoustic details: texture, material, space, distance, resonance
- Reference timing and rhythm if relevant
- Describe the sound's character: bright/dark, sharp/soft, metallic/organic
- Keep under 80 words and under 400 characters (STRICT LIMIT — ElevenLabs rejects longer prompts)
- Output ONLY the enhanced prompt text, nothing else`

export async function enrichPrompt(
  query: string,
  neighbors: Neighbor[],
  duration: number | null
): Promise<string> {
  const neighborContext = neighbors
    .slice(0, 5)
    .map((n, i) => `${i + 1}. "${n.title}" (${n.score}% match) — ${n.description}`)
    .join('\n')

  const durationNote = duration ? `Target duration: ${duration} seconds.` : ''

  const userMessage = `User's request: "${query}"

Similar sounds in our library:
${neighborContext}

${durationNote}

Create an enhanced, detailed prompt for generating this sound effect.`

  const { text } = await generateText({
    model: 'google/gemini-2.0-flash',
    system: SYSTEM_PROMPT,
    prompt: userMessage,
    maxTokens: 300,
  })

  return text || query
}
