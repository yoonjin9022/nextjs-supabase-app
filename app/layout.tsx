import './globals.css'

import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

import { WebVitals } from '@/components/web-vitals'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

const description = '주차 요금을 미리 계산하고 예산을 관리하는 스마트 주차 도우미'

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: 'ParkingMeter',
    template: '%s | ParkingMeter',
  },
  description,
  keywords: ['주차요금 계산', '주차 미터', '주차 요금', '실시간 주차', '주차 예산 관리'],
  openGraph: {
    title: 'ParkingMeter',
    description,
    url: defaultUrl,
    siteName: 'ParkingMeter',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'ParkingMeter',
    description,
  },
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  display: 'swap',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* offset.bottom: 탭바 높이(64px) + 여백(8px) */}
          <Toaster richColors position="bottom-center" offset={{ bottom: 72 }} />
          {/* Web Vitals 수집 (CLS, FCP, INP, LCP, TTFB) */}
          <WebVitals />
        </ThemeProvider>
      </body>
    </html>
  )
}
