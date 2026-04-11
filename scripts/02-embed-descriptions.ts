import fs from 'fs'
import path from 'path'
import { pipeline } from '@huggingface/transformers'

const CATALOG_PATH = path.join(__dirname, 'data', 'freesound-catalog.json')
const OUTPUT_PATH = path.join(__dirname, 'data', 'freesound-embeddings.json')
const CHECKPOINT_PATH = path.join(__dirname, 'data', 'embed-checkpoint.json')
const BATCH_SIZE = 64
// all-MiniLM-L6-v2: 384 dims, fast, good quality for semantic search
const MODEL = 'Xenova/all-MiniLM-L6-v2'

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

async function main() {
  // Read catalog
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error(`Catalog not found at ${CATALOG_PATH}. Run pipeline:scrape first.`)
    process.exit(1)
  }

  const catalog: CatalogEntry[] = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'))
  console.log(`Loaded ${catalog.length} sounds from catalog`)

  // Load checkpoint if exists
  const done = new Map<number, EmbeddingEntry>()
  if (fs.existsSync(CHECKPOINT_PATH)) {
    const checkpoint: EmbeddingEntry[] = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf-8'))
    for (const entry of checkpoint) {
      done.set(entry.freesoundId, entry)
    }
    console.log(`Resuming: ${done.size} embeddings already computed`)
  }

  // Filter out already-embedded entries
  const remaining = catalog.filter(c => !done.has(c.freesoundId))
  console.log(`${remaining.length} descriptions to embed`)

  if (remaining.length === 0) {
    console.log('All embeddings already computed. Writing output...')
    writeOutput(Array.from(done.values()))
    return
  }

  // Load the embedding model (downloads on first run, cached after)
  console.log(`\nLoading model ${MODEL}... (first run downloads ~80MB, cached after)`)
  const embedder = await pipeline('feature-extraction', MODEL, {
    dtype: 'fp32',
  })
  console.log('Model loaded!\n')

  // Process in batches
  const totalBatches = Math.ceil(remaining.length / BATCH_SIZE)
  const startTime = Date.now()

  for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
    const start = batchIdx * BATCH_SIZE
    const batch = remaining.slice(start, start + BATCH_SIZE)

    // Build input text
    const inputs = batch.map(c => {
      const tagStr = c.tags.join(', ')
      return `${c.title}. ${c.description} Tags: ${tagStr}`.slice(0, 512)
    })

    try {
      // Run embeddings locally — no API calls!
      const results = await embedder(inputs, { pooling: 'mean', normalize: true })

      for (let i = 0; i < batch.length; i++) {
        const embedding = Array.from(results[i].data as Float32Array)
        done.set(batch[i].freesoundId, {
          freesoundId: batch[i].freesoundId,
          embedding,
        })
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
      const rate = (done.size / parseFloat(elapsed)).toFixed(0)
      console.log(`Batch ${batchIdx + 1}/${totalBatches} — ${done.size}/${catalog.length} (${rate} items/s, ${elapsed}s elapsed)`)

      // Checkpoint every 20 batches
      if (batchIdx % 20 === 0 && batchIdx > 0) {
        fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(Array.from(done.values())))
        console.log('  [checkpoint saved]')
      }
    } catch (err: any) {
      console.error(`  [ERROR] Batch ${batchIdx + 1} failed:`, err.message)
      fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(Array.from(done.values())))
      console.log('  [checkpoint saved on error - rerun to resume]')
      process.exit(1)
    }
  }

  // Write final output
  const embeddings = Array.from(done.values())
  writeOutput(embeddings)

  // Clean up checkpoint
  if (fs.existsSync(CHECKPOINT_PATH)) {
    fs.unlinkSync(CHECKPOINT_PATH)
  }
}

function writeOutput(embeddings: EmbeddingEntry[]) {
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(embeddings))
  console.log(`\nDone! Wrote ${embeddings.length} embeddings to ${OUTPUT_PATH}`)
  console.log(`Dimensions: ${embeddings[0]?.embedding.length ?? 0}`)

  const stats = fs.statSync(OUTPUT_PATH)
  const sizeMB = (stats.size / 1024 / 1024).toFixed(1)
  console.log(`Output file size: ${sizeMB} MB`)
}

main().catch(console.error)
