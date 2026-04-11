import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  boolean,
  jsonb,
  serial,
  varchar,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  image: text('image'),
  provider: varchar('provider', { length: 50 }).default('google'),
  providerAccountId: varchar('provider_account_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const generationJobs = pgTable('generation_jobs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id),
  query: text('query').notNull(),
  enrichedPrompt: text('enriched_prompt'),
  duration: real('duration'),
  neighbors: jsonb('neighbors').$type<NeighborJson[]>(),
  category: varchar('category', { length: 50 }).default('All'),
  playCount: integer('play_count').default(0).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const variations = pgTable('variations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: text('job_id').references(() => generationJobs.id).notNull(),
  variationIndex: integer('variation_index').notNull(),
  audioUrl: text('audio_url').notNull(),
  duration: real('duration'),
  waveformData: jsonb('waveform_data').$type<number[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const libraryEntries = pgTable('library_entries', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  variationId: text('variation_id').references(() => variations.id).notNull(),
  savedAt: timestamp('saved_at').defaultNow().notNull(),
})

export const scenes = pgTable('scenes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id),
  description: text('description').notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const sceneLayers = pgTable('scene_layers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sceneId: text('scene_id').references(() => scenes.id).notNull(),
  layerType: varchar('layer_type', { length: 20 }).notNull(),
  query: text('query').notNull(),
  enrichedPrompt: text('enriched_prompt'),
  neighbors: jsonb('neighbors').$type<NeighborJson[]>(),
  audioUrl: text('audio_url'),
  waveformData: jsonb('waveform_data').$type<number[]>(),
  duration: real('duration'),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// JSON type for neighbors stored in generation_jobs
interface NeighborJson {
  id: string
  title: string
  score: number
  description: string
  freesoundId?: number
  tags?: string[]
}
