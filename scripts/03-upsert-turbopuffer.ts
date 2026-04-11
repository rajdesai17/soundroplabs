import fs from 'fs'
import path from 'path'

const CATALOG_PATH = path.join(__dirname, 'data', 'freesound-catalog.json')
const EMBEDDINGS_PATH = path.join(__dirname, 'data', 'freesound-embeddings.json')
const BATCH_SIZE = 200

const TURBOPUFFER_API_KEY = process.env.TURBOPUFFER_API_KEY
const NAMESPACE = process.env.TURBOPUFFER_NAMESPACE || 'sounddrop'
const TURBOPUFFER_BASE = 'https://api.turbopuffer.com/v1'

interface CatalogEntry {
  freesoundId: number
  title: string
  description: string
  tags: string[]
  duration: number
}

interface EmbeddingEntry {
  freesoundId: number
  embedding: number[]
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function upsertBatch(vectors: any[]): Promise<void> {
  const url = `${TURBOPUFFER_BASE}/vectors/${NAMESPACE}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURBOPUFFER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ upserts: vectors, distance_metric: 'cosine_distance' }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Turbopuffer upsert failed (${res.status}): ${text}`)
  }
}

async function main() {
  if (!TURBOPUFFER_API_KEY) {
    console.error('TURBOPUFFER_API_KEY is required. Set it in .env.local.')
    process.exit(1)
  }

  // Load catalog
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error(`Catalog not found at ${CATALOG_PATH}. Run pipeline:scrape first.`)
    process.exit(1)
  }
  if (!fs.existsSync(EMBEDDINGS_PATH)) {
    console.error(`Embeddings not found at ${EMBEDDINGS_PATH}. Run pipeline:embed first.`)
    process.exit(1)
  }

  const catalog: CatalogEntry[] = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'))
  const embeddings: EmbeddingEntry[] = JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf-8'))

  console.log(`Loaded ${catalog.length} catalog entries and ${embeddings.length} embeddings`)

  // Build lookup maps
  const catalogMap = new Map<number, CatalogEntry>()
  for (const c of catalog) catalogMap.set(c.freesoundId, c)

  const embeddingMap = new Map<number, number[]>()
  for (const e of embeddings) embeddingMap.set(e.freesoundId, e.embedding)

  // Join: only include entries that have both catalog data and embeddings
  const joined: { catalog: CatalogEntry; embedding: number[] }[] = []
  for (const [id, entry] of catalogMap) {
    const emb = embeddingMap.get(id)
    if (emb) {
      joined.push({ catalog: entry, embedding: emb })
    }
  }

  console.log(`${joined.length} entries have both catalog data and embeddings`)
  console.log(`Upserting to namespace "${NAMESPACE}" in batches of ${BATCH_SIZE}...\n`)

  const totalBatches = Math.ceil(joined.length / BATCH_SIZE)

  for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
    const start = batchIdx * BATCH_SIZE
    const batch = joined.slice(start, start + BATCH_SIZE)

    const vectors = batch.map(({ catalog: c, embedding }) => ({
      id: String(c.freesoundId),
      vector: embedding,
      attributes: {
        title: c.title,
        description: c.description.slice(0, 300),
        tags: c.tags.join(', '),
        duration: Math.round(c.duration),
      },
    }))

    console.log(`Batch ${batchIdx + 1}/${totalBatches} (${batch.length} vectors)...`)

    try {
      await upsertBatch(vectors)
      console.log(`  Upserted ${batch.length} vectors`)
    } catch (err: any) {
      console.error(`  [ERROR] Batch ${batchIdx + 1} failed:`, err.message)
      console.log('  Retrying in 3s...')
      await sleep(3000)

      try {
        await upsertBatch(vectors)
        console.log(`  Retry succeeded`)
      } catch (retryErr: any) {
        console.error(`  [FATAL] Retry failed:`, retryErr.message)
        console.error(`  Stopping at batch ${batchIdx + 1}. Rerun to continue (turbopuffer deduplicates by ID).`)
        process.exit(1)
      }
    }

    // Small delay between batches
    if (batchIdx < totalBatches - 1) {
      await sleep(200)
    }
  }

  console.log(`\nDone! Upserted ${joined.length} vectors to turbopuffer namespace "${NAMESPACE}"`)
}

main().catch(console.error)
