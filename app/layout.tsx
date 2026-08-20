import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SystemMK',
  description: 'Monastery Management System for tracking monks, rooms, finance, inventory, and more.',
  keywords: ['monastery', 'monks', 'khmer', 'buddhist', 'management', 'systemmk'],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SystemMK',
  },
  icons: {
    icon: '/app-logo.png?v=3',
    shortcut: '/app-logo.png?v=3',
    apple: '/app-logo.png?v=3',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0F17' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="km">
      <head>
        <link rel="icon" href="/app-logo.png?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/app-logo.png?v=2" />
        <link rel="shortcut icon" href="/app-logo.png?v=2" />
      </head>
      <body>{children}</body>
    </html>
  )
}
