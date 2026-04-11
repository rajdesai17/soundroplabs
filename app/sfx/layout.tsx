import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Generate Sound Effects',
  description: 'Describe any sound in natural language and get 4 unique AI-generated variations. Powered by semantic search over 26,000 real sounds and ElevenLabs SFX API.',
  openGraph: {
    title: 'Generate Sound Effects | SoundDropLabs',
    description: 'Describe any sound. Get 4 unique AI-generated variations in seconds.',
  },
}

export default function SfxLayout({ children }: { children: React.ReactNode }) {
  return children
}
