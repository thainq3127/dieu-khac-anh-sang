import { Inter, Brygada_1918 } from 'next/font/google'
import '@/app/globals.css'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
})

const brygada = Brygada_1918({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-brygada',
  display: 'swap',
})

export default function PreviewNewBlocksLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable} ${brygada.variable} scroll-smooth`}>
      <body className="bg-bg text-ivory font-sans min-h-screen">
        {children}
      </body>
    </html>
  )
}
