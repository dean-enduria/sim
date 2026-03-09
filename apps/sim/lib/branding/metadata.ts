import type { Metadata } from 'next'
import { getBaseUrl } from '@/lib/core/utils/urls'
import { getBrandConfig } from '@/lib/branding/config'

/**
 * Generate dynamic metadata based on brand configuration.
 * Moved from ee/whitelabeling/metadata.
 */
export function generateBrandedMetadata(override: Partial<Metadata> = {}): Metadata {
  const brand = getBrandConfig()

  const defaultTitle = brand.name
  const summaryShort = `An open-source AI agent workflow builder for production workflows.`

  return {
    title: {
      template: `%s | ${brand.name}`,
      default: defaultTitle,
    },
    description: summaryShort,
    applicationName: brand.name,
    authors: [{ name: brand.name }],
    generator: 'Next.js',
    keywords: [
      'AI agent',
      'AI agent builder',
      'AI agent workflow',
      'AI workflow automation',
      'visual workflow editor',
      'AI agents',
      'workflow canvas',
      'intelligent automation',
      'AI tools',
      'workflow designer',
      'artificial intelligence',
      'business automation',
      'AI agent workflows',
      'visual programming',
    ],
    referrer: 'origin-when-cross-origin',
    creator: brand.name,
    publisher: brand.name,
    metadataBase: new URL(getBaseUrl()),
    alternates: {
      canonical: '/',
      languages: {
        'en-US': '/',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: getBaseUrl(),
      title: defaultTitle,
      description: summaryShort,
      siteName: brand.name,
      images: [
        {
          url: brand.logoUrl || '/logo/426-240/primary/small.png',
          width: 2130,
          height: 1200,
          alt: brand.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: summaryShort,
      images: [brand.logoUrl || '/logo/426-240/primary/small.png'],
    },
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        {
          url: '/favicon/favicon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          url: '/favicon/favicon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        { url: brand.faviconUrl || '/sim.png', sizes: 'any', type: 'image/png' },
      ],
      apple: '/favicon/apple-touch-icon.png',
      shortcut: brand.faviconUrl || '/favicon/favicon.ico',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: brand.name,
    },
    formatDetection: {
      telephone: false,
    },
    category: 'technology',
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'mobile-web-app-capable': 'yes',
      'msapplication-TileColor': '#701FFC',
      'msapplication-config': '/favicon/browserconfig.xml',
    },
    ...override,
  }
}

/**
 * Generate static structured data for SEO.
 * Moved from ee/whitelabeling/metadata.
 */
export function generateStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Workflows',
    description:
      'An open-source AI agent workflow builder for production workflows.',
    url: getBaseUrl(),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    applicationSubCategory: 'AIWorkflowAutomation',
    areaServed: 'Worldwide',
    availableLanguage: ['en'],
    featureList: [
      'Visual AI Agent Builder',
      'Workflow Canvas Interface',
      'AI Agent Automation',
      'Custom AI Workflows',
    ],
  }
}
