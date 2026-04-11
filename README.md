# SoundDropLabs

AI-powered sound design tool. Describe any sound or scene — get production-ready audio in seconds.

**Built for [#ElevenHacks](https://elevenlabs.io) hackathon.**

Live: [v0-soundroplabs.vercel.app](https://v0-soundroplabs.vercel.app)

---

## What it does

SoundDropLabs generates sound effects and full scene soundscapes using AI, grounded in semantic search over 26,000 real-world sounds.

### Two modes

**SFX Mode** — Describe a single sound. Get 4 unique variations + an optional music bed.
- "thunderstorm indoors" → 4 distinct thunder sound effects + ambient music track

**Scene Mode** — Describe a full scene. AI decomposes it into 4 sonic layers (ambience, foreground, background, music) and generates each one.
- "abandoned warehouse, broken glass, distant siren" → 4 layered audio tracks with DAW-style mixer, Play All, and ZIP export

---

## How it works

Every generation runs through a 4-stage pipeline:

```
Describe → Embed → Search → Enrich → Generate
```

1. **Embed** — User query is converted to a 384-dimensional vector via HuggingFace Inference API (sentence-transformers/all-MiniLM-L6-v2)
2. **Search** — Vector is matched against 26,264 indexed sounds in turbopuffer using cosine similarity. Returns 8 acoustic neighbors in ~20ms.
3. **Enrich** — Gemini 2.0 Flash takes the query + neighbors and writes a detailed acoustic prompt optimized for audio generation (under 400 characters for ElevenLabs limits)
4. **Generate** — ElevenLabs Sound Effects API renders the audio. For music beds and scene music layers, the ElevenLabs Music API generates 30-second instrumental tracks.

All stages stream to the browser via Server-Sent Events (SSE) — users see neighbors appear, prompts build, and audio materialize in real-time.

### Scene Mode pipeline

Scene Mode adds a decomposition step before the main pipeline:

```
Describe scene → Gemini decomposes into 4 layers → 4 parallel pipelines → DAW mixer
```

Each layer runs its own embed → search → enrich → generate pipeline concurrently. That means turbopuffer handles 4 targeted semantic searches per scene — each layer is grounded in different real-world sounds. The music layer uses the ElevenLabs Music API instead of SFX.

---

## Tech stack

| Layer | Technology | Role |
|-------|-----------|------|
| Framework | Next.js 16, React 19 | App Router, SSE streaming, client components |
| Embeddings | HuggingFace Inference API | all-MiniLM-L6-v2, 384-dim vectors, ~200ms per query |
| Vector search | turbopuffer | 26,264 indexed Freesound samples, cosine similarity, ~20ms |
| Prompt enrichment | Google Gemini 2.0 Flash | Via Vercel AI Gateway, acoustic prompt optimization |
| SFX generation | ElevenLabs Sound Effects API | 4 parallel variations per query |
| Music generation | ElevenLabs Music API | 30s instrumental beds, force_instrumental |
| Audio storage | Vercel Blob (private) | Server-side proxy for browser playback |
| Database | Neon Postgres + Drizzle ORM | Generation history, user library, play counts |
| Auth | NextAuth + Google OAuth | JWT strategy, session persistence |
| Styling | Tailwind CSS v4 | Dark theme, custom design tokens |
| Deployment | Vercel | Fluid Compute, SSE support |

### Data pipeline (offline)

The 26,264 sound index was built via a 3-step offline pipeline:

1. **Scrape** — 280 search terms queried against the Freesound API, collecting metadata for 26,264 unique sounds
2. **Embed** — Each sound's title + description + tags embedded locally using @huggingface/transformers (all-MiniLM-L6-v2)
3. **Index** — Vectors + metadata upserted to turbopuffer in batches of 200

Runtime queries use the same model (via HuggingFace Inference API) to ensure dimensional compatibility.

---

## Architecture

```
Browser
  │
  ├─ /sfx ────────── EventSource (GET /api/generate)
  │                     ├─ embedQuery() ──── HuggingFace Inference API
  │                     ├─ queryNeighbors() ── turbopuffer REST API
  │                     ├─ enrichPrompt() ─── Gemini 2.0 Flash (AI Gateway)
  │                     ├─ generateSFX() ──── ElevenLabs SFX API × 4
  │                     └─ upload to Vercel Blob → stream results via SSE
  │
  ├─ /scene ──────── fetch POST /api/scene (ReadableStream)
  │                     ├─ decomposeScene() ── Gemini → 4 layer specs
  │                     └─ Promise.allSettled([
  │                          processSfxLayer("ambience"),
  │                          processSfxLayer("foreground"),
  │                          processSfxLayer("background"),
  │                          processMusicLayer("music")
  │                        ])
  │
  ├─ /gallery ────── GET /api/gallery → Neon Postgres
  ├─ /library ────── GET/POST/DELETE /api/library → Neon Postgres
  └─ /sound/[id] ─── GET /api/sound/[id] → Neon Postgres
```

---

## Key design decisions

- **Same embedding model everywhere** — all-MiniLM-L6-v2 (384 dims) for both offline indexing and runtime queries. No dimension mismatch.
- **Private blob + proxy** — Audio stored in private Vercel Blob. A server-side proxy (`/api/blob`) fetches with auth token and returns audio bytes with correct Content-Type headers for browser playback.
- **Non-blocking DB writes** — Generation succeeds even if Neon is unreachable. DB persistence is fire-and-forget.
- **Mock fallback** — Every API route checks for missing env vars and degrades to mock data. The app is fully navigable without any API keys.
- **Partial failure resilience** — Scene Mode uses `Promise.allSettled` for 4 parallel layers. If 2 fail, the other 2 still render and play.

---

## Project structure

```
app/
  page.tsx              # Landing page
  sfx/page.tsx          # SFX generation (Zone A→B→C)
  scene/page.tsx        # Scene Mode (input→generating→results)
  gallery/page.tsx      # Public gallery of generated sounds
  library/page.tsx      # User's saved sounds
  sound/[id]/page.tsx   # Sound permalink
  api/
    generate/route.ts   # SSE pipeline — SFX generation
    scene/route.ts      # SSE pipeline — Scene decomposition + 4 layers
    music/route.ts      # ElevenLabs Music API
    blob/route.ts       # Private blob audio proxy
    gallery/route.ts    # Public gallery query
    library/route.ts    # User library CRUD
    sound/[id]/route.ts # Sound permalink data
    play/route.ts       # Play count tracking
    auth/[...nextauth]/ # Google OAuth

lib/
  embeddings.ts         # HuggingFace Inference API client
  turbopuffer.ts        # turbopuffer REST client
  claude.ts             # Gemini prompt enrichment
  elevenlabs.ts         # ElevenLabs SFX client
  scene-decompose.ts    # Gemini scene decomposition
  waveform-extract.ts   # Audio buffer → waveform data
  db/schema.ts          # Drizzle ORM schema (6 tables)
  db/index.ts           # Lazy DB client
  auth.ts               # NextAuth config
  types.ts              # TypeScript interfaces
  scene-types.ts        # Scene Mode types

hooks/
  use-scene-stream.ts   # POST-based SSE consumer
  use-scene-mixer.ts    # HTMLAudioElement-based multi-track mixer

components/
  home/                 # ZoneA (search), ZoneB (loading), ZoneC (results)
  scene/                # SceneInput, SceneGenerating, SceneResults, LayerTrack
  shared/               # Navigation, SoundCard, VariationCard, WaveformThumbnail

scripts/
  01-scrape-freesound.ts  # Freesound metadata scraper
  02-embed-descriptions.ts # Local embedding pipeline
  03-upsert-turbopuffer.ts # Vector index population
```

---

## Database schema

| Table | Purpose |
|-------|---------|
| `users` | Google OAuth users |
| `generation_jobs` | SFX generation history (query, prompt, neighbors, play count) |
| `variations` | Individual audio variations (blob URL, waveform data) |
| `library_entries` | User's saved sounds |
| `scenes` | Scene Mode generations |
| `scene_layers` | Individual scene layers (4 per scene) |

---

## Environment variables

```env
# Required for real generation
HF_API_TOKEN=           # HuggingFace (free, read-only scope)
TURBOPUFFER_API_KEY=    # turbopuffer
ELEVENLABS_API_KEY=     # ElevenLabs
AI_GATEWAY_API_KEY=     # Vercel AI Gateway
BLOB_READ_WRITE_TOKEN=  # Vercel Blob

# Database (optional — falls back to mock)
DATABASE_URL=           # Neon Postgres

# Auth (optional)
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

The app works without any keys — all routes fall back to mock data.

---

## Running locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

Deployed on Vercel. Push to `main` triggers automatic deployment.

```bash
git push origin main
```

Environment variables must be set in the Vercel dashboard.
