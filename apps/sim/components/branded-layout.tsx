'use client'

import { BrandingLoader } from '@/components/branding-loader'

interface BrandedLayoutProps {
  children: React.ReactNode
}

export function BrandedLayout({ children }: BrandedLayoutProps) {
  return (
    <>
      <BrandingLoader />
      {children}
    </>
  )
}
