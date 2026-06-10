import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TrackPay Admin',
  description: 'Panneau d\'administration TrackPay',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
