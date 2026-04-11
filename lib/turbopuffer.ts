import { Neighbor } from './types'

const API_KEY = process.env.TURBOPUFFER_API_KEY
const NAMESPACE = process.env.TURBOPUFFER_NAMESPACE || 'sounddrop'
const BASE_URL = 'https://api.turbopuffer.com/v1'

interface TurbopufferResult {
  id: string
  dist: number
  attributes: {
    title: string
    description: string
    tags: string
    duration: number
  }
}

export async function queryNeighbors(embedding: number[], topK: number = 8): Promise<Neighbor[]> {
  const url = `${BASE_URL}/vectors/${NAMESPACE}/query`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      vector: embedding,
      top_k: topK,
      distance_metric: 'cosine_distance',
      include_attributes: ['title', 'description', 'tags', 'duration'],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Turbopuffer query failed (${res.status}): ${text}`)
  }

  const results: TurbopufferResult[] = await res.json()

  return results.map((r, i) => ({
    id: `n${i + 1}`,
    title: r.attributes.title,
    // Convert cosine distance (0=identical, 2=opposite) to 0-100 similarity score
    score: Math.round((1 - r.dist) * 100),
    description: r.attributes.description.slice(0, 120),
    freesoundId: Number(r.id),
    tags: r.attributes.tags ? r.attributes.tags.split(', ') : [],
  }))
}
