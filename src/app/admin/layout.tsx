import type { Metadata } from 'next'
import { Inter, Brygada_1918 } from 'next/font/google'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter', display: 'swap' })
const brygada = Brygada_1918({ subsets: ['latin', 'vietnamese'], variable: '--font-brygada', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Admin – Văn Hóa Chăm', template: '%s | Admin' },
  icons: {
    icon: '/favicon.png',
  },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable} ${brygada.variable}`}>
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  )
}
