# SoundDrop — Product Requirements Document v2

> Generate any sound effect you can describe. Powered by semantic search + ElevenLabs AI.

---

## 1. The Core Problem (sharpened)

**The real friction isn't the search — it's the audition loop.**

Sound designers on Freesound, Splice, and Epidemic Sound don't just search badly. They search, click, wait for load, hear the wrong thing, go back, repeat — 40 times per session. The audition loop is broken, not just the search.

SoundDrop fixes *both*:
1. **Search**: Natural language → semantic match → no keyword guessing
2. **Audition**: Multiple instant variations, hover-to-play everywhere, refine without starting over

ElevenLabs themselves discovered this when building SB1 — the right UX is generate 4 variations, audition inline, pick your favorite. One output is not enough. Users need to compare.

---

## 2. UX Principles (research-derived)

These come from CHI 2024 generative AI design research, Splice's product evolution, Eagle's audio UX study, and ElevenLabs' own builder docs.

### Principle 1 — Solve the blank canvas immediately
Users freeze when they see an empty input. The home page must show rotating real examples AND a gallery of what others generated — so users understand the possibility space before they type anything. Source: shapeof.ai pattern library.

### Principle 2 — Generate multiple variations, not one
ElevenLabs' own team — when building SB1 — found that generating 4 variations and letting users audition inline produces dramatically better outcomes than one "perfect" generation. Small prompt changes ("metallic" vs "soft") produce very different outputs. Users need to compare. This is the core UX insight.

### Principle 3 — Hover-to-play everywhere
Eagle's audio UX research shows hover-to-play "drastically reduces audio selection time." Every sound card in every context (gallery, library, results) should play on hover — not just on explicit click. This removes a click from the most repeated action in the entire app.

### Principle 4 — Show the chain, don't hide it
CHI 2024: gen AI tools must show what's happening to build calibrated trust. SoundDrop's turbopuffer semantic search is the magic — users must see which Freesound neighbors shaped their generation. This isn't decoration; it's the difference between "cool magic trick" and "I understand why this sound came out this way."

### Principle 5 — Support iteration, not just generation
Splice's biggest UX advantage is filtering that narrows search without starting over. SoundDrop needs one-click refinements: "Make it darker", "More distant", "Shorter", "Add room reverb feel". These append to the prompt and regenerate — no blank slate needed.

### Principle 6 — Stay on one page
Modern AI tools (Perplexity, v0, etc.) keep generation in context. Navigating to /generate breaks momentum. The search, loading state, and results should all happen on one page with smooth transitions. Route changes are for library and gallery only.

### Principle 7 — Duration is a creative control
ElevenLabs SFX v2 supports duration from 0.5s to 22s. This is not a technical setting — it's a creative decision. "A quick crack" vs "a long rolling thunder" implies different durations. Show it as a slider users can set before generating. Default: auto (model decides from prompt).

---

## 3. Target Users (with jobs-to-be-done)

| User | Job to be done | Current workaround | Frequency |
|---|---|---|---|
| YouTube editor | Find a specific SFX that fits a scene emotionally, not just sonically | Spend 30+ min on Freesound + Epidemic Sound | Per edit |
| Indie game dev | Generate non-generic UI sounds, ambient loops, Foley for scenes | License stock packs that don't fit their game's tone | Per project milestone |
| Podcast producer | Custom intro music + transition stings that match show's voice | Use generic royalty-free music that sounds like everyone else | Per episode |
| Short film maker | Get custom Foley for scenes without a sound studio | Hire a freelancer or improvise with wrong sounds | Per project |
| Streamer/content creator | Reactive sound effects for live use, Twitch alerts, drops | Static soundboard of downloaded MP3s | Daily |

---

## 4. Page Architecture

```
/ (home — single page app with inline results)
/gallery
/library
/sound/[id] (shareable sound permalink)
```

---

## 5. Page Specifications

---

### 5.1 Home — The Core Experience

**This is a single-page experience. No navigation on generate.**

#### Zone A — Hero (before search)

Layout: full-viewport, vertically centered.

- Eyebrow: `TURBOPUFFER + ELEVENLABS` — DM Mono 11px, #444, letter-spacing 0.15em
- Headline 2 lines:
  - Line 1: `Describe any sound.` — Instrument Serif 64px #F0F0F0
  - Line 2: `Hear it instantly.` — Instrument Serif 64px italic #666
- Sub: `Stop hunting stock libraries. Generate the exact sound you hear in your head.` — Geist 17px #555, max-width 460px

**Search bar (the primary element):**
- 640px max-width, 60px height, #111 bg, 1px border #2A2A2A
- Focus state: border #E8F055, very subtle yellow-green box shadow (0 0 0 2px rgba(232,240,85,0.08))
- Placeholder rotates every 3s with crossfade:
  - `"Heavy wooden door creaking in a stone corridor..."`
  - `"Thunderstorm, distant, heard from inside a car..."`
  - `"80s arcade coin collect, punchy and satisfying..."`
  - `"Coffee shop morning ambience, background chatter..."`
  - `"Spaceship engine idle, low and mechanical..."`
  - `"Glass breaking on concrete, close and sharp..."`
- Inside bar, right: duration pill + Generate button
  - Duration pill: `Auto ↕` — clicking opens a tiny popover with a duration slider (0.5s–22s). DM Mono 12px.
  - Generate button: `Generate →` — #E8F055 bg, #0A0A0A text, 44px height, 4px radius
- Below bar right: character counter `0 / 300` in DM Mono 12px #333

**Example chips:** 6 chips below the bar, clicking pre-fills and auto-submits

**Stats bar:** 3 metrics below chips — DM Mono, minimal:
- `24,891 sounds generated`
- `4.2s avg generation`
- `100% royalty-free`

---

#### Zone B — Generating (replaces Zone A, inline)

When user submits, Zone A smoothly transitions out (300ms fade+slide up). Zone B fills the space:

**Left (60%):**

Status block:
```
Searching 50,000 sounds...        ← DM Mono 14px #888, cycling
[████████░░░░░░░░░░] 40%          ← thin progress bar, #E8F055 fill
```

Status messages cycle at 1s intervals:
1. `Searching 50,000 sounds...`
2. `Found 8 acoustic neighbors...`
3. `Building generation prompt...`
4. `Generating 4 variations...`

Below status: "Influenced by" list — 8 neighbor sound titles appearing one-by-one (stagger 120ms each), each on its own line:
```
∙ heavy wooden door creak stone corridor — 91% match
∙ iron gate opening slowly — 87%
∙ dungeon door old wood — 83%
...
```
DM Mono 12px, #444 → brightens to #888 as each appears. The match % is the turbopuffer score.

**Right (40%): Waveform placeholder**
- 4 grey ghost waveform bars (the 4 variations that will appear), pulsing with loading animation

---

#### Zone C — Results (replaces Zone B, inline)

**4 Variations grid:**

2×2 grid of variation cards. Each card:
- **Waveform** (real, using wavesurfer.js): 100% width, 64px height. Unplayed = #2A2A2A bars. On hover — audio PLAYS IMMEDIATELY (hover-to-play). Played bars = #E8F055.
- **Variation label**: `Variation 1` in DM Mono 11px #444
- **Duration**: `0:07` DM Mono 12px #888
- **Controls row**: Play/Pause icon | Download | Save | ♥ (favorite)
- Keyboard shortcut hint: `[1]` `[2]` `[3]` `[4]` — tiny DM Mono 10px #333 in top-right corner of each card

The selected variation (click to select): border becomes 1px #E8F055, subtle background shift to #141400.

**Refinement bar (below the 2×2 grid):**

One-line row of suggestion pills the user can click to re-generate with modifications:
```
Refine: [Darker] [More distant] [Shorter] [Add reverb] [Louder impact] [Softer]
```
Each pill: DM Mono 12px, border 1px #2A2A2A, hover → #1A1A1A bg. Clicking appends the modifier to the original query and re-runs generation. Does NOT start over — shows loading inline.

**"Influenced by" sidebar (right 35%):**

Now persistent and readable:
- "Shaped by 8 sounds from our library" — DM Mono 11px #444
- List of 8 neighbor cards:
  - Similarity bar: thin 2px wide bar, % width = similarity score, #E8F055 fill on #1A1A1A bg
  - Title: Geist 13px #888
  - Hover: expands to show truncated Freesound description + tags in DM Mono 11px #444
- Below list: turbopuffer attribution — `turbopuffer semantic search · 50k sounds indexed` DM Mono 10px #2A2A2A

**"Start over" link:** small, below results — `← New search` in Geist 13px #555, returns to Zone A

---

### 5.2 Gallery (`/gallery`)

Purpose: social proof + discovery loop. Every new visitor should immediately see the possibility space.

**Header:**
- `What people are hearing` — Instrument Serif 40px #F0F0F0
- Live counter with blinking dot: `↑ 3 new sounds in the last hour` — DM Mono 12px #E8F055

**Filter tabs:**
- All · Nature · Mechanical · Human · Horror · Sci-Fi · Urban · Weather · Game · Film
- Tab: Geist 13px, active = bottom border 2px #E8F055 + text #F0F0F0, inactive = #555

**Trending row:**
- Horizontal scroll of 5 featured cards with large play counts
- Label: `TRENDING THIS WEEK` DM Mono 11px #333 letter-spacing 0.12em

**Main grid:**
- 3 columns desktop → 2 tablet → 1 mobile
- Each card: hover-to-play immediately (no click required)
- Card contents:
  - Category badge top-left: DM Mono 10px, 1px border #2A2A2A
  - Query text: Geist 14px #F0F0F0, 2 lines max
  - Waveform thumbnail (static SVG, visually representative)
  - Footer: `0:07 · 2.1k plays` DM Mono 12px #555 | `Try this →` Geist 12px #E8F055
- Hover state: border brightens to #444, waveform starts animating (playing), play count increments visually

---

### 5.3 Library (`/library`)

Personal sound archive. Requires auth.

**Not logged in:** centered card — "Sign in to save sounds" + Google button. Minimal, no full-page takeover.

**Logged in:**
- Toolbar: search input + sort (`Newest / Most played / Shortest / Longest`) + `New sound +` CTA
- Grid: same card design as gallery but with:
  - Hover: shows delete icon (top-right, appears on hover)
  - Right-click menu: Rename / Download / Copy share link / Delete

**Empty state:** large waveform icon (#111 tone-on-tone) + `No sounds yet` Instrument Serif 24px + CTA

---

### 5.4 Sound Permalink (`/sound/[id]`)

Shareable page for a single generated sound.

- Full-width waveform player (wavesurfer.js)
- Original query text
- All 4 variations (if saved)
- "Influenced by" neighbors
- "Generate similar" button — pre-fills home search with this query
- OG image: auto-generated waveform image for social card

---

## 6. Component Specifications

### Waveform Player

Use `wavesurfer.js` — it's the standard, well-maintained, React-compatible.

```ts
WaveSurfer.create({
  container: '#waveform',
  waveColor: '#2A2A2A',
  progressColor: '#E8F055',
  cursorColor: '#E8F055',
  barWidth: 2,
  barGap: 1,
  barRadius: 1,
  height: 64,
  normalize: true,
})
```

Hover-to-play on cards: `mouseenter` → `wavesurfer.play()`, `mouseleave` → `wavesurfer.pause(); wavesurfer.seekTo(0)`

### ElevenLabs UI Components

Use the official `@elevenlabs/ui` component library — they publish waveform, orb, and audio player components specifically built for Next.js + shadcn/ui. Install:
```bash
npx @elevenlabs/cli@latest components add waveform
npx @elevenlabs/cli@latest components add live-waveform
```
This saves days of custom canvas work.

### Duration Slider (in search bar)

- Appears as a small popover anchored to the `Auto ↕` pill
- Slider: 0.5s to 22s, step 0.5
- Default: `Auto` (sends null to API — ElevenLabs decides from prompt context)
- Preset chips inside popover: `Short (1–3s)` / `Medium (5–10s)` / `Long (15–22s)`
- This directly maps to ElevenLabs `duration_seconds` param

### Variation Card

```
┌─────────────────────────────┐ [1]
│ ▓▓▒▓▓▒▓▒▒▓▓▓▒▓▒▓▒▓▓▒▓▒▓▓▒ │ ← wavesurfer
│                         0:07│
│  ▶  ↓  ♥                   │
└─────────────────────────────┘
  Variation 1
```

---

## 7. Design System

### Aesthetic
Dark, precise, audio-professional. Not generic AI. Not consumer-cute. Think: a mastering engineer's dashboard crossed with Linear's density and Splice's waveform-first thinking.

### Colors
```css
--bg-base:        #0A0A0A
--bg-surface:     #111111
--bg-elevated:    #1A1A1A
--border-default: #2A2A2A
--border-focus:   #444444
--border-accent:  #E8F055
--text-primary:   #F0F0F0
--text-secondary: #888888
--text-tertiary:  #444444
--text-ghost:     #2A2A2A
--accent:         #E8F055   /* electric yellow-green — used sparingly */
--accent-dim:     #B8C040
--danger:         #E05A5A
--success:        #5AE08A
```

### Typography
- **Instrument Serif** — headlines, hero text, empty states, emotional moments
- **DM Mono** — all numbers, timestamps, percentages, labels, metadata, code, counters, technical text
- **Geist** — navigation, buttons, body text, descriptions, CTAs

Rule: anything that changes (a number, a score, a timestamp) is DM Mono. Anything static and human is Geist or Instrument Serif.

### Motion
- Page transitions: 200ms ease-out
- Zone A → B → C: 300ms fade + 8px translateY transition (smooth, not jarring)
- Waveform bars load: stagger 20ms per bar, height animates from 2px to full
- Neighbor list: stagger 100ms per item, opacity 0 → 1 + translateX(-4px) → 0
- Hover-to-play: no animation delay, instant

### Spacing
- Base unit: 4px
- Card internal padding: 16px
- Grid gap: 12px
- Section vertical rhythm: 48px desktop, 32px mobile
- Border radius: 8px cards, 4px buttons/chips, 2px bars, 0px waveform

### Accessibility
- All waveform players keyboard accessible (Space = play/pause, Arrow = seek 5s)
- Variation cards: keyboard shortcut `1`–`4` to select
- Focus styles: 2px outline in #E8F055 at 2px offset
- Hover-to-play must also be triggered by focus (for keyboard users)

---

## 8. API Design

### `POST /api/generate`

**Request:**
```ts
{
  query: string          // user's natural language description
  duration?: number      // seconds (null = auto)
  count?: number         // variations to generate (default: 4)
  seed?: number          // for regeneration
}
```

**Response (streamed):**
```ts
{
  jobId: string
  status: 'searching' | 'enriching' | 'generating' | 'done' | 'error'
  neighbors?: Neighbor[]          // appears at 'enriching' stage
  enrichedPrompt?: string         // appears at 'generating' stage
  variations?: SoundVariation[]   // appears at 'done'
}
```

**Why streaming:** Users see neighbors appear before audio is ready. This makes the 4–8s wait feel interactive and explains what's happening — matching CHI 2024 principle of showing the chain.

### `GET /api/gallery?category=&sort=&page=`
### `POST /api/library` — save a variation
### `DELETE /api/library/[id]`
### `GET /api/sound/[id]` — permalink fetch

---

## 9. Data Models

### SoundVariation
```ts
{
  id: string
  jobId: string
  variationIndex: 1 | 2 | 3 | 4
  audioUrl: string           // Vercel Blob
  duration: number
  waveformData: number[]     // pre-computed amplitude array for static thumbnails
}
```

### GenerationJob
```ts
{
  id: string
  userId: string | null
  query: string
  enrichedPrompt: string
  duration: number | null
  neighbors: Neighbor[]
  variations: SoundVariation[]
  category: string           // auto-classified by Claude
  playCount: number
  isPublic: boolean
  createdAt: Date
}
```

### Neighbor
```ts
{
  freesoundId: number
  title: string
  description: string        // truncated to 120 chars
  tags: string[]
  similarityScore: number    // 0–1 from turbopuffer
}
```

---

## 10. Hackathon MVP Scope

### Day 1 — Data
- [ ] Freesound API scraper (300 search queries × 150 results = ~45k sounds)
- [ ] Embedding pipeline (OpenAI text-embedding-3-small)
- [ ] turbopuffer index + schema with metadata attributes
- [ ] Test queries manually, validate neighbor quality

### Day 2 — Core pipeline
- [ ] `/api/generate` with streaming response
- [ ] Claude prompt-enrichment step
- [ ] ElevenLabs SFX API integration (4 parallel calls)
- [ ] Vercel Blob storage for audio files

### Day 3 — UI (v0)
- [ ] Home page with Zone A → B → C flow
- [ ] Waveform player (wavesurfer.js)
- [ ] Neighbor list component
- [ ] Variation 2×2 grid

### Day 4 — Polish
- [ ] Hover-to-play on all cards
- [ ] Refinement pills (Darker / Shorter / etc.)
- [ ] Duration slider
- [ ] Gallery with pre-generated examples (20+)

### Day 5 — Auth + Library
- [ ] Google auth (NextAuth)
- [ ] Save/library functionality
- [ ] Share permalinks

### Day 6 — Demo video
- [ ] Record 6 searches: start weird, go emotional, go funny, demo refinement
- [ ] 90s max, no voiceover, music only
- [ ] Caption overlay showing the query text

### Skip entirely for hackathon
- [ ] Blend mode (two queries)
- [ ] Voice input
- [ ] Paid tiers