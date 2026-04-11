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

export const metadata: Metadata = {
  title: 'SoundDropLabs — AI Sound Design',
  description: 'Describe any sound in natural language and instantly get generated audio variations. Stop hunting stock libraries.',
  generator: 'v0.app',
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
      <body className={`${geist.variable} ${instrumentSerif.variable} ${dmMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
