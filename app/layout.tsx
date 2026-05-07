import type { Metadata, Viewport } from 'next'
import { Sora, DM_Sans, JetBrains_Mono } from 'next/font/google'
import '@/app/globals.css'

const sora = Sora({ subsets: ['latin'], weight: ['400','500','600','700','800'], variable: '--font-sora', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300','400','500','600','700'], variable: '--font-dm-sans', display: 'swap' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400','500'], variable: '--font-jetbrains-mono', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'AssinaJá', template: '%s · AssinaJá' },
  description: 'Assine e envie contratos digitais em minutos. Simples, seguro e sem conta.',
  applicationName: 'AssinaJá',
  openGraph: { type: 'website', locale: 'pt_MZ', siteName: 'AssinaJá', title: 'AssinaJá — Assinatura digital simples', description: 'Assine e envie contratos digitais em minutos.' },
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false,
  themeColor: '#F4F5FB', colorScheme: 'light', viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={[sora.variable, dmSans.variable, jetbrainsMono.variable].join(' ')}>
      <body>{children}</body>
    </html>
  )
}
