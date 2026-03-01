'use client'

/**
 * Stubbed SSO hooks.
 * SSO is managed by Enduria via SSOReady.
 */

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '@/hooks/queries/organization'

// Re-export constants from the server-safe module
export { SSO_TRUSTED_PROVIDERS } from '@/lib/stubs/sso-constants'

export const ssoKeys = {
  all: ['sso'] as const,
  providers: () => [...ssoKeys.all, 'providers'] as const,
}

export function useSSOProviders() {
  return useQuery({
    queryKey: ssoKeys.providers(),
    queryFn: async () => ({ providers: [] }),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })
}

interface ConfigureSSOParams {
  provider: string
  domain: string
  clientId: string
  clientSecret: string
  orgId?: string
}

export function useConfigureSSO() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (_config: ConfigureSSOParams) => {
      return { success: true }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ssoKeys.providers() })

      if (variables.orgId) {
        queryClient.invalidateQueries({
          queryKey: organizationKeys.detail(variables.orgId),
        })
        queryClient.invalidateQueries({
          queryKey: organizationKeys.lists(),
        })
      }
    },
  })
}
