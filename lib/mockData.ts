import { SoundEntry, Category, Neighbor, Variation } from './types'

// Generate random waveform data
function generateWaveformData(): number[] {
  const data: number[] = []
  for (let i = 0; i < 80; i++) {
    // Create more natural looking waveform with clusters
    const base = Math.random() * 0.4 + 0.1
    const spike = Math.random() > 0.7 ? Math.random() * 0.5 : 0
    data.push(Math.min(1, base + spike))
  }
  return data
}

export const mockGalleryData: SoundEntry[] = [
  {
    id: '1',
    query: 'Dungeon door opening, slow and ominous, with creaking hinges',
    category: 'Horror',
    duration: 7,
    playCount: 2100,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-04-08'),
  },
  {
    id: '2',
    query: 'Thunderstorm rolling in the distance with occasional rumbles',
    category: 'Weather',
    duration: 15,
    playCount: 3400,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-04-09'),
  },
  {
    id: '3',
    query: 'Retro arcade coin drop with electronic chime',
    category: 'Game',
    duration: 2,
    playCount: 8900,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-04-07'),
  },
  {
    id: '4',
    query: 'Busy coffee shop ambience with chatter and espresso machine',
    category: 'Urban',
    duration: 18,
    playCount: 5200,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-04-06'),
  },
  {
    id: '5',
    query: 'Spaceship engine humming steadily in hyperspace',
    category: 'Sci-Fi',
    duration: 12,
    playCount: 4100,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-04-05'),
  },
  {
    id: '6',
    query: 'Glass bottle shattering on concrete floor',
    category: 'Mechanical',
    duration: 3,
    playCount: 6700,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-04-04'),
  },
  {
    id: '7',
    query: 'Forest ambience with birds chirping and gentle wind',
    category: 'Nature',
    duration: 22,
    playCount: 7800,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-04-03'),
  },
  {
    id: '8',
    query: 'Deep breath followed by a nervous exhale',
    category: 'Human',
    duration: 4,
    playCount: 2300,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-04-02'),
  },
  {
    id: '9',
    query: 'Old radio tuning between static stations',
    category: 'Mechanical',
    duration: 8,
    playCount: 3100,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-04-01'),
  },
  {
    id: '10',
    query: 'Cinematic tension riser building to climax',
    category: 'Film',
    duration: 10,
    playCount: 9200,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-03-30'),
  },
  {
    id: '11',
    query: 'Heavy rain on tin roof with occasional thunder',
    category: 'Weather',
    duration: 16,
    playCount: 4500,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-03-29'),
  },
  {
    id: '12',
    query: 'Creepy whisper saying something unintelligible',
    category: 'Horror',
    duration: 5,
    playCount: 3800,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-03-28'),
  },
  {
    id: '13',
    query: 'Laser gun firing with sci-fi pew pew effect',
    category: 'Sci-Fi',
    duration: 2,
    playCount: 7100,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-03-27'),
  },
  {
    id: '14',
    query: 'Crowd cheering at a sports stadium',
    category: 'Human',
    duration: 11,
    playCount: 5600,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-03-26'),
  },
  {
    id: '15',
    query: 'Video game power-up collection sound',
    category: 'Game',
    duration: 1,
    playCount: 12000,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-03-25'),
  },
  {
    id: '16',
    query: 'Ocean waves crashing on rocky shore',
    category: 'Nature',
    duration: 20,
    playCount: 8400,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-03-24'),
  },
  {
    id: '17',
    query: 'Car engine revving aggressively',
    category: 'Mechanical',
    duration: 6,
    playCount: 4900,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-03-23'),
  },
  {
    id: '18',
    query: 'Subway train arriving at platform',
    category: 'Urban',
    duration: 14,
    playCount: 2800,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-03-22'),
  },
  {
    id: '19',
    query: 'Epic orchestral hit for trailer impact',
    category: 'Film',
    duration: 3,
    playCount: 11000,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-03-21'),
  },
  {
    id: '20',
    query: 'Footsteps walking slowly on gravel path',
    category: 'Human',
    duration: 9,
    playCount: 3600,
    waveformData: generateWaveformData(),
    createdAt: new Date('2024-03-20'),
  },
]

export const mockNeighbors: Neighbor[] = [
  { id: 'n1', title: 'heavy door creak stone', score: 91, description: 'A heavy wooden door creaking open in a stone corridor' },
  { id: 'n2', title: 'iron gate opening slow', score: 87, description: 'An old iron gate slowly swinging open with rusty hinges' },
  { id: 'n3', title: 'dungeon door old wood', score: 83, description: 'Ancient wooden dungeon door with metal reinforcements' },
  { id: 'n4', title: 'medieval chest opening', score: 79, description: 'A medieval treasure chest lid being lifted' },
  { id: 'n5', title: 'large wooden cabinet', score: 74, description: 'Large oak cabinet door opening with aged wood sounds' },
  { id: 'n6', title: 'barn door sliding', score: 68, description: 'A weathered barn door sliding on its track' },
  { id: 'n7', title: 'wood planks creaking floor', score: 61, description: 'Old wooden floor planks creaking underfoot' },
  { id: 'n8', title: 'old drawer opening squeaky', score: 54, description: 'An antique drawer being pulled open with squeaky runners' },
]

export const examplePrompts = [
  'wooden door creak',
  'thunderstorm indoors',
  'arcade coin',
  'coffee shop',
  'spaceship engine',
  'glass breaking',
]

export function generateMockVariations(): Variation[] {
  return [1, 2, 3, 4].map(index => ({
    id: `var-${index}-${Date.now()}`,
    index,
    audioUrl: `/mock-audio-${index}.mp3`,
    waveformData: generateWaveformData(),
    duration: Math.floor(Math.random() * 15) + 3,
  }))
}

export const categories: Category[] = [
  'All',
  'Nature',
  'Mechanical',
  'Human',
  'Horror',
  'Sci-Fi',
  'Urban',
  'Weather',
  'Game',
  'Film',
]

export const refinementOptions = [
  'Darker',
  'More distant',
  'Shorter',
  'Add reverb',
  'Louder impact',
  'Try again',
]

// Get unique frequency for each mock card for demo tone playback
export function getCardFrequency(index: number): number {
  const frequencies = [220, 277, 330, 392, 440, 523, 587, 659, 740, 880]
  return frequencies[index % frequencies.length]
}
