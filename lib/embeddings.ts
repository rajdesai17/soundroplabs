import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers'

const MODEL = 'Xenova/all-MiniLM-L6-v2'

let embedder: FeatureExtractionPipeline | null = null
let loading: Promise<FeatureExtractionPipeline> | null = null

/**
 * Get or initialize the embedding model. Singleton pattern ensures
 * the model is loaded once per function instance (Fluid Compute reuses instances).
 */
async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (embedder) return embedder
  if (loading) return loading

  loading = pipeline('feature-extraction', MODEL, {
    dtype: 'fp32',
  }) as Promise<FeatureExtractionPipeline>

  embedder = await loading
  loading = null
  return embedder
}

/**
 * Embed a single query. Uses the same all-MiniLM-L6-v2 model (384 dims)
 * as the pipeline scripts to match the Turbopuffer index.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const emb = await getEmbedder()
  const result = await emb(text, { pooling: 'mean', normalize: true })
  return Array.from(result.data as Float32Array)
}
