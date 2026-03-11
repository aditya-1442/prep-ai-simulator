import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PrepAI — AI-Powered Interview Preparation',
  description: 'Generate targeted interview questions and one-page summaries from any URL using advanced AI. Prepare smarter, not harder.',
  keywords: 'AI interview prep, interview questions, AI summary, job preparation',
  openGraph: {
    title: 'PrepAI — AI-Powered Interview Preparation',
    description: 'Generate targeted interview questions and one-page summaries from any URL using advanced AI.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
