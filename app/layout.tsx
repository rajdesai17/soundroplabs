import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Instrument_Serif, DM_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Providers from '@/components/Providers'
import './globals.css'

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist'
})

const instrumentSerif = Instrument_Serif({ 
  weight: ['400'], 
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-instrument-serif'
})

const dmMono = DM_Mono({ 
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono'
})

const SITE_URL = process.env.NEXTAUTH_URL || 'https://v0-soundroplabs.vercel.app'

export const metadata: Metadata = {
  title: {
    default: 'SoundDropLabs — AI Sound Design Tool',
    template: '%s | SoundDropLabs',
  },
  description: 'Generate sound effects and full scene soundscapes with AI. Semantic search over 26,000 real sounds, powered by turbopuffer and ElevenLabs.',
  keywords: ['AI sound effects', 'sound design', 'AI audio generator', 'sound effect generator', 'scene sound design', 'ElevenLabs', 'turbopuffer', 'AI music', 'foley', 'SFX generator'],
  authors: [{ name: 'SoundDropLabs' }],
  creator: 'SoundDropLabs',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'SoundDropLabs',
    title: 'SoundDropLabs — AI Sound Design Tool',
    description: 'Describe any sound or scene. Get production-ready audio in seconds. Powered by semantic search over 26,000 real sounds.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SoundDropLabs — AI Sound Design Tool',
    description: 'Describe any sound or scene. Get production-ready audio in seconds.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'SoundDropLabs',
              url: SITE_URL,
              description: 'AI-powered sound design tool. Generate sound effects and full scene soundscapes with semantic search over 26,000 real sounds.',
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                'AI sound effect generation',
                'Scene decomposition into 4 sonic layers',
                'Semantic search over 26,000 real sounds',
                'DAW-style multi-track mixer',
                'Music bed generation',
                'ZIP export',
              ],
            }),
          }}
        />
      </head>
      <body className={`${geist.variable} ${instrumentSerif.variable} ${dmMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
