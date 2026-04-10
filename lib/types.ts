export type Category = 
  | 'All'
  | 'Nature' 
  | 'Mechanical' 
  | 'Human' 
  | 'Horror' 
  | 'Sci-Fi' 
  | 'Urban' 
  | 'Weather' 
  | 'Game' 
  | 'Film'

export interface SoundEntry {
  id: string
  query: string
  category: Category
  duration: number // in seconds
  playCount: number
  waveformData: number[] // array of 80 numbers 0-1
  createdAt: Date
}

export interface Variation {
  id: string
  index: number // 1-4
  audioUrl: string
  waveformData: number[]
  duration: number
}

export interface Neighbor {
  id: string
  title: string
  score: number // 0-100
  description: string
}

export interface GenerationResult {
  query: string
  variations: Variation[]
  neighbors: Neighbor[]
}

export type Zone = 'A' | 'B' | 'C'

export type GenerationStage = 
  | 'searching'
  | 'found-neighbors'
  | 'building-prompt'
  | 'generating'
  | 'complete'

export interface LibrarySoundEntry extends SoundEntry {
  savedAt: Date
}

export interface User {
  id: string
  email: string
  name: string
  initials: string
}
