import { useCallback } from 'react'
import { createLogger } from '@sim/logger'
import { useQueryClient } from '@tanstack/react-query'
import { useSession, useSubscription } from '@/lib/auth/auth-client'
import { organizationKeys } from '@/hooks/queries/organization'

const logger = createLogger('SubscriptionUpgrade')

type TargetPlan = 'pro' | 'team'

const CONSTANTS = {
  INITIAL_TEAM_SEATS: 1,
} as const

export function useSubscriptionUpgrade() {
  const { data: session } = useSession()
  const subscription = useSubscription()
  const queryClient = useQueryClient()

  const handleUpgrade = useCallback(
    async (targetPlan: TargetPlan) => {
      const userId = session?.user?.id
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Stubbed - subscription management is handled by Enduria
      logger.warn('useSubscriptionUpgrade is stubbed - billing is managed by Enduria', {
        targetPlan,
        userId,
      })
    },
    [session?.user?.id, subscription, queryClient]
  )

  return { handleUpgrade }
}
