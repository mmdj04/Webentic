import type { Metadata } from 'next'

import '@/styles/globals.css'

import { FeatureFlagProvider, TelemetryTagManager } from 'common'
import { genFaviconData } from 'common/MetaFavicons/app-router'
import { Inter } from 'next/font/google'

import { Providers } from './Providers'
import { Toaster } from './toaster'
import { API_URL } from '@/lib/constants'

const inter = Inter({ subsets: ['latin'] })

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export const metadata: Metadata = {
  applicationName: 'Webentic Open-Source',
  title: 'Webentic Open-Source',
  description: 'Webentic Open-Source — UI library, Design System and ESM CDN',
  metadataBase: new URL('https://webentic-ui.vercel.app'),
  icons: genFaviconData(BASE_PATH),
  openGraph: {
    type: 'article',
    authors: 'Webentic',
    url: `${BASE_PATH}`,
    images: `${BASE_PATH}/img/webentic-og-image.png`,
    publishedTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webentic',
    creator: '@webentic',
    images: `${BASE_PATH}/img/webentic-og-image.png`,
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default async function Layout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} antialiased`}>
        <TelemetryTagManager />
        <FeatureFlagProvider API_URL={API_URL}>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </FeatureFlagProvider>
      </body>
    </html>
  )
}
