import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Browse AI-generated sound effects and scene soundscapes created by the SoundDropLabs community.',
  openGraph: {
    title: 'Sound Gallery | SoundDropLabs',
    description: 'Browse AI-generated sounds from the SoundDropLabs community.',
  },
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children
}
