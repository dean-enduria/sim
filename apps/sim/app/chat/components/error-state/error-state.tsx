'use client'

import { useRouter } from 'next/navigation'
import { BrandedButton } from '@/components/shared/branded-button'
import { StatusPageLayout } from '@/components/shared/status-page-layout'

interface ChatErrorStateProps {
  error: string
}

export function ChatErrorState({ error }: ChatErrorStateProps) {
  const router = useRouter()

  return (
    <StatusPageLayout title='Chat Unavailable' description={error}>
      <BrandedButton onClick={() => router.push('/workspace')}>Return to Workspace</BrandedButton>
    </StatusPageLayout>
  )
}
