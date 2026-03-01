'use client'

import { useRouter } from 'next/navigation'
import { BrandedButton } from '@/components/shared/branded-button'
import { StatusPageLayout } from '@/components/shared/status-page-layout'

export default function NotFound() {
  const router = useRouter()

  return (
    <StatusPageLayout
      title='Page Not Found'
      description="The page you're looking for doesn't exist or has been moved."
    >
      <BrandedButton onClick={() => router.push('/')}>Return to Home</BrandedButton>
    </StatusPageLayout>
  )
}
