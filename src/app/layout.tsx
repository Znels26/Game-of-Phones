import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Realmfall — Living Fantasy World Simulator',
  description: 'An immersive fantasy world simulator. Build kingdoms, command armies, and unleash chaos.',
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⬡</text></svg>" },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0806',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-body bg-realm-bg text-realm-parchment h-screen overflow-hidden">
        {children}
      </body>
    </html>
  )
}
