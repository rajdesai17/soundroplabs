import { pipeline } from '@huggingface/transformers'

const TURBOPUFFER_API_KEY = process.env.TURBOPUFFER_API_KEY
const NAMESPACE = process.env.TURBOPUFFER_NAMESPACE || 'sounddrop'
const TURBOPUFFER_BASE = 'https://api.turbopuffer.com/v1'

let embedder: any = null

async function embedQuery(text: string): Promise<number[]> {
  if (!embedder) {
    console.log('Loading embedding model...')
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'fp32' })
    console.log('Model loaded!\n')
  }
  const result = await embedder(text, { pooling: 'mean', normalize: true })
  return Array.from(result.data as Float32Array)
}

async function queryTurbopuffer(vector: number[], topK: number = 8) {
  const url = `${TURBOPUFFER_BASE}/vectors/${NAMESPACE}/query`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURBOPUFFER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      vector,
      top_k: topK,
      distance_metric: 'cosine_distance',
      include_attributes: ['title', 'description', 'tags', 'duration'],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Query failed (${res.status}): ${text}`)
  }

  return res.json()
}

async function main() {
  if (!TURBOPUFFER_API_KEY) {
    console.error('TURBOPUFFER_API_KEY is required.')
    process.exit(1)
  }

  const testQueries = [
    'heavy wooden door creaking in a stone corridor',
    'thunderstorm heard from inside a car',
    '80s arcade coin collect sound',
    'spaceship engine idle, low and mechanical',
  ]

  for (const query of testQueries) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Query: "${query}"`)
    console.log('='.repeat(60))

    const embedding = await embedQuery(query)
    console.log(`  Embedding dimensions: ${embedding.length}`)

    const result = await queryTurbopuffer(embedding)

    if (result && Array.isArray(result)) {
      for (let i = 0; i < result.length; i++) {
        const r = result[i]
        const score = r.dist != null ? Math.round((1 - r.dist) * 100) : '?'
        const title = r.attributes?.title || 'unknown'
        const desc = r.attributes?.description?.slice(0, 80) || ''
        console.log(`  ${i + 1}. [${score}%] ${title}`)
        if (desc) console.log(`     ${desc}`)
      }
    } else {
      console.log('  No results or unexpected format:', JSON.stringify(result).slice(0, 200))
    }
  }

  console.log('\nDone!')
}

main().catch(console.error)
