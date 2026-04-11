import { Neighbor } from './types'

export type LayerType = 'ambience' | 'foreground' | 'background' | 'music'

export const LAYER_TYPES: LayerType[] = ['ambience', 'foreground', 'background', 'music']

export const LAYER_COLORS: Record<LayerType, string> = {
  ambience: '#4A9EFF',
  foreground: '#E8F055',
  background: '#8B5CF6',
  music: '#F59E0B',
}

export const LAYER_LABELS: Record<LayerType, string> = {
  ambience: 'AMBIENCE',
  foreground: 'FOREGROUND',
  background: 'BACKGROUND',
  music: 'MUSIC BED',
}

export interface SceneLayerSpec {
  type: LayerType
  query: string
  reasoning: string
}

export interface SceneLayerResult {
  type: LayerType
  query: string
  enrichedPrompt: string | null
  neighbors: Neighbor[]
  audioUrl: string | null
  waveformData: number[]
  duration: number
  status: 'pending' | 'generating' | 'complete' | 'error'
  error?: string
  latencyMs?: number
}

export type SceneSSEEvent =
  | { type: 'decomposition'; layers: SceneLayerSpec[] }
  | { type: 'layer-start'; layerType: LayerType; message: string }
  | { type: 'layer-neighbors'; layerType: LayerType; neighbors: Neighbor[]; latencyMs: number }
  | { type: 'layer-complete'; layerType: LayerType; audioUrl: string; waveformData: number[]; duration: number }
  | { type: 'layer-error'; layerType: LayerType; message: string }
  | { type: 'complete'; sceneId: string }
  | { type: 'error'; message: string }
