'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '@/hooks/queries/organization'

/**
 * Query key factories for SSO-related queries
 */
export const ssoKeys = {
  all: ['sso'] as const,
  providers: () => [...ssoKeys.all, 'providers'] as const,
}

/**
 * Stubbed - SSO is managed by Enduria.
 */
export function useSSOProviders() {
  return useQuery({
    queryKey: ssoKeys.providers(),
    queryFn: async () => ({ providers: [] }),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })
}

/**
 * Stubbed - SSO configuration is managed by Enduria.
 */
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
