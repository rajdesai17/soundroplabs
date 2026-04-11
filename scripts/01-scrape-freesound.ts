import fs from 'fs'
import path from 'path'

const API_KEY = process.env.FREESOUND_API_KEY
const OUTPUT_PATH = path.join(__dirname, 'data', 'freesound-catalog.json')
const DELAY_MS = 1100 // slightly over 1s to stay under 60 req/min

// ~300 search terms across PRD categories
const SEARCH_TERMS = [
  // Nature
  'rain', 'thunder', 'wind', 'ocean waves', 'river stream', 'waterfall', 'birds chirping',
  'forest ambience', 'leaves rustling', 'crickets night', 'wolf howl', 'campfire crackling',
  'earthquake rumble', 'avalanche', 'volcano eruption', 'ice cracking', 'hail storm',
  'tropical rainforest', 'desert wind', 'snowstorm blizzard', 'bee buzzing', 'frog croaking',
  'whale song', 'dolphins', 'eagle screech', 'owl hooting', 'rain on leaves',
  'morning birds dawn', 'jungle ambience', 'cave dripping water',
  // Weather
  'thunderstorm close', 'lightning strike', 'heavy rain', 'light rain drizzle', 'wind howling',
  'tornado siren', 'hailstorm', 'rain on window', 'rain on tin roof', 'storm approaching',
  'thunder distant', 'rain on umbrella', 'wind chimes storm', 'snow falling', 'fog horn weather',
  'monsoon rain', 'tropical storm', 'ice storm freezing', 'gusty wind', 'rain puddle splash',
  // Mechanical
  'engine start', 'car door slam', 'machine whirring', 'gears grinding', 'clock ticking',
  'typewriter', 'lock clicking', 'chain rattling', 'metal scraping', 'hydraulic press',
  'steam release', 'generator humming', 'drill buzzing', 'saw cutting wood', 'welding torch',
  'factory ambience', 'conveyor belt', 'compressor air', 'turbine engine', 'robot servo motor',
  'engine revving', 'car engine idle', 'motorcycle start', 'train engine', 'helicopter rotor',
  'elevator machinery', 'printing press', 'cash register', 'sewing machine', 'garage door opening',
  // Human
  'footsteps gravel', 'footsteps wood floor', 'breathing heavy', 'heartbeat', 'crowd cheering',
  'laughter', 'baby crying', 'whispering', 'clapping hands', 'snoring',
  'coughing', 'yawning', 'eating crunchy', 'drinking slurp', 'typing keyboard',
  'pen writing', 'page turning', 'zipper', 'knocking door', 'finger snap',
  'whistling', 'humming tune', 'screaming', 'gasp surprise', 'crowd murmur',
  'applause audience', 'children playing', 'running footsteps', 'walking high heels', 'bones cracking',
  // Horror
  'creaky door', 'haunted house ambience', 'ghost whisper', 'chains dragging', 'dungeon ambience',
  'zombie groan', 'monster growl', 'eerie wind', 'creepy music box', 'blood splatter',
  'knife sharpening', 'bone breaking', 'heartbeat fast horror', 'breath in darkness', 'spider crawling',
  'demonic voice', 'evil laugh', 'graveyard ambience', 'rats scurrying', 'old floorboard creak',
  'coffin opening', 'werewolf howl', 'jump scare sting', 'horror drone', 'scratching wall',
  'basement horror', 'horror stinger', 'flesh tearing', 'dripping blood', 'sinister whisper',
  // Sci-Fi
  'spaceship engine', 'laser gun', 'alien communication', 'teleporter beam', 'robot voice',
  'spaceship door', 'force field hum', 'plasma weapon', 'warp drive', 'computer beeping scifi',
  'hologram activate', 'space station ambience', 'zero gravity float', 'energy shield', 'mech walking',
  'cyberpunk ambience', 'data transfer digital', 'quantum computer', 'cryopod opening', 'satellite signal',
  'UFO hovering', 'space debris', 'airlock depressurize', 'ion thruster', 'radar ping scifi',
  'electromagnetic pulse', 'particle beam', 'antigravity', 'hyperspace jump', 'android boot',
  // Urban
  'city traffic', 'car horn honking', 'subway train', 'bus stopping', 'police siren',
  'ambulance siren', 'fire truck siren', 'construction site', 'jackhammer', 'car alarm',
  'skateboard rolling', 'bicycle bell', 'street performer', 'coffee shop ambience', 'restaurant ambience',
  'bar pub ambience', 'shopping mall', 'airport announcement', 'train station', 'elevator ding',
  'office ambience', 'phone ringing', 'door buzzer intercom', 'garbage truck', 'street sweeper',
  'crosswalk beeping', 'parking garage', 'highway traffic', 'neon sign buzzing', 'vending machine',
  // Game
  'coin collect', 'power up', 'game over', 'level complete', 'health pickup',
  'sword slash', 'bow arrow', 'magic spell cast', 'explosion game', 'jump landing',
  'menu select', 'menu navigate', 'achievement unlock', 'damage hit', 'shield block',
  'inventory open', 'potion drink', 'treasure chest', 'enemy death', 'boss music intro',
  'combo hit', 'critical strike', 'dodge roll', 'footstep grass game', 'water splash game',
  'fire spell', 'ice spell freeze', 'lightning spell', 'portal open', 'countdown timer beep',
  // Film
  'cinematic boom', 'trailer impact', 'whoosh transition', 'tension riser', 'dramatic reveal',
  'orchestral hit', 'suspense drone', 'emotional piano', 'epic horn brass', 'choir dramatic',
  'film grain noise', 'old projector', 'record scratch', 'vinyl crackle', 'radio static',
  'flashback transition', 'time passing', 'montage transition', 'dramatic silence', 'heartbeat tension',
  'war explosion', 'gunshot distant', 'sword fight clang', 'car chase tire screech', 'helicopter flyover',
  'door slam dramatic', 'glass breaking dramatic', 'punch hit', 'body fall', 'dramatic wind',
  // Extra / cross-category
  'water dripping', 'bubble underwater', 'splash', 'fire crackling', 'paper crumpling',
  'glass clinking', 'wood breaking', 'stone grinding', 'cloth ripping', 'rope snap',
  'bell ringing', 'chime', 'gong', 'drum hit', 'cymbal crash',
  'piano note', 'guitar strum', 'synth pad', 'bass drop', 'vinyl scratch',
]

interface FreesoundResult {
  id: number
  name: string
  description: string
  tags: string[]
  duration: number
}

interface FreesoundSearchResponse {
  count: number
  results: FreesoundResult[]
}

interface CatalogEntry {
  freesoundId: number
  title: string
  description: string
  tags: string[]
  duration: number
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 3) + '...'
}

async function searchFreesound(query: string, pageSize: number = 150): Promise<FreesoundResult[]> {
  const params = new URLSearchParams({
    query,
    page_size: String(pageSize),
    fields: 'id,name,description,tags,duration',
    token: API_KEY!,
  })

  const url = `https://freesound.org/apiv2/search/text/?${params}`
  const res = await fetch(url)

  if (!res.ok) {
    const text = await res.text()
    console.error(`  [ERROR] ${res.status} for "${query}": ${text}`)
    return []
  }

  const data: FreesoundSearchResponse = await res.json()
  return data.results || []
}

async function main() {
  if (!API_KEY) {
    console.error('FREESOUND_API_KEY is required. Set it in .env.local and run with:')
    console.error('  dotenv -e .env.local -- pnpm pipeline:scrape')
    console.error('  OR: FREESOUND_API_KEY=your_key pnpm pipeline:scrape')
    process.exit(1)
  }

  // Load existing progress if any (for resume)
  const seen = new Map<number, CatalogEntry>()
  let startIndex = 0

  const progressPath = path.join(__dirname, 'data', 'scrape-progress.json')
  if (fs.existsSync(progressPath)) {
    const progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'))
    for (const entry of progress.entries) {
      seen.set(entry.freesoundId, entry)
    }
    startIndex = progress.lastTermIndex + 1
    console.log(`Resuming from term ${startIndex}/${SEARCH_TERMS.length}, ${seen.size} sounds already collected`)
  }

  console.log(`Scraping Freesound with ${SEARCH_TERMS.length} search terms...`)
  console.log(`Starting from term index ${startIndex}\n`)

  for (let i = startIndex; i < SEARCH_TERMS.length; i++) {
    const term = SEARCH_TERMS[i]
    console.log(`[${i + 1}/${SEARCH_TERMS.length}] Searching "${term}"...`)

    try {
      const results = await searchFreesound(term)
      let newCount = 0

      for (const r of results) {
        if (!seen.has(r.id)) {
          seen.set(r.id, {
            freesoundId: r.id,
            title: r.name,
            description: truncate(r.description.replace(/\n/g, ' ').trim(), 300),
            tags: r.tags.slice(0, 10),
            duration: Math.round(r.duration * 100) / 100,
          })
          newCount++
        }
      }

      console.log(`  Found ${results.length} results, ${newCount} new. Total unique: ${seen.size}`)

      // Save progress every 10 terms
      if (i % 10 === 0) {
        const progressData = {
          lastTermIndex: i,
          entries: Array.from(seen.values()),
        }
        fs.writeFileSync(progressPath, JSON.stringify(progressData))
        console.log(`  [checkpoint saved]`)
      }
    } catch (err) {
      console.error(`  [ERROR] Failed for "${term}":`, err)
    }

    // Rate limit
    if (i < SEARCH_TERMS.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  // Write final catalog
  const catalog = Array.from(seen.values())
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(catalog, null, 2))
  console.log(`\nDone! Wrote ${catalog.length} unique sounds to ${OUTPUT_PATH}`)

  // Clean up progress file
  if (fs.existsSync(progressPath)) {
    fs.unlinkSync(progressPath)
  }
}

main().catch(console.error)
