'use client'

import { useRouter } from 'next/navigation'
import { BrandedButton } from '@/components/shared/branded-button'
import { StatusPageLayout } from '@/components/shared/status-page-layout'

interface FormErrorStateProps {
  error: string
}

export function FormErrorState({ error }: FormErrorStateProps) {
  const router = useRouter()

  return (
    <StatusPageLayout title='Form Unavailable' description={error} hideNav>
      <BrandedButton onClick={() => router.push('/workspace')}>Return to Workspace</BrandedButton>
    </StatusPageLayout>
  )
}
