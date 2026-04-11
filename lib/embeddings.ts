import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HF_API_TOKEN)

/**
 * Embed a single query via HuggingFace Inference API.
 * Uses the same all-MiniLM-L6-v2 model (384 dims) as the pipeline scripts
 * to match the Turbopuffer index — but hosted, so no cold-start model download.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const result = await hf.featureExtraction({
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    inputs: text,
  })
  // HF returns a nested array for sentence transformers — flatten it
  const embedding = Array.isArray(result[0]) ? result[0] as number[] : result as number[]
  return embedding
}
