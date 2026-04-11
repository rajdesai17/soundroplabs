import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scene Sound Design',
  description: 'Describe a scene — AI decomposes it into ambience, foreground, background, and music layers. 4 parallel pipelines, DAW mixer, ZIP export.',
  openGraph: {
    title: 'Scene Sound Design | SoundDropLabs',
    description: 'Describe a scene. AI generates 4 sonic layers with a DAW-style mixer.',
  },
}

export default function SceneLayout({ children }: { children: React.ReactNode }) {
  return children
}
