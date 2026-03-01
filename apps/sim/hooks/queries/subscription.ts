import { keepPreviousData, useQuery } from '@tanstack/react-query'

/**
 * Query key factories for subscription-related queries.
 * Stubbed out - billing is handled by Enduria.
 */
export const subscriptionKeys = {
  all: ['subscription'] as const,
  user: (includeOrg?: boolean) => [...subscriptionKeys.all, 'user', { includeOrg }] as const,
  usage: () => [...subscriptionKeys.all, 'usage'] as const,
}

/**
 * Default stubbed subscription data.
 * Billing is handled by Enduria, so we return enterprise defaults with no limits.
 * Typed as `any` to satisfy all consumers without importing billing types.
 */
function getStubSubscriptionData(): any {
  return {
    id: null,
    isPaid: true,
    isPro: false,
    isTeam: false,
    isEnterprise: true,
    plan: 'enterprise',
    status: 'active',
    seats: null,
    metadata: null,
    stripeSubscriptionId: null,
    periodEnd: null,
    cancelAtPeriodEnd: false,
    billingBlocked: false,
    billingBlockedReason: null,
    usage: {
      current: 0,
      limit: 999999,
      percentUsed: 0,
      isWarning: false,
      isExceeded: false,
      billingPeriodStart: null,
      billingPeriodEnd: null,
      lastPeriodCost: 0,
    },
    usage_limit: 999999,
    organization: null,
    creditBalance: 0,
    referralCode: null,
  }
}

/**
 * Stubbed subscription data hook.
 * Returns unlimited plan defaults since billing is handled by Enduria.
 */
export function useSubscriptionData(_options: { includeOrg?: boolean; enabled?: boolean } = {}) {
  return useQuery<{ data: any }>({
    queryKey: subscriptionKeys.user(_options.includeOrg),
    queryFn: async () => ({
      data: getStubSubscriptionData(),
    }),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    enabled: _options.enabled ?? true,
  })
}

/**
 * Stubbed usage limit data hook.
 */
export function useUsageLimitData(_options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: subscriptionKeys.usage(),
    queryFn: async () => ({
      data: {
        currentLimit: 999999,
        minimumLimit: 0,
        canEdit: false,
        plan: 'enterprise',
        updatedAt: new Date().toISOString(),
      },
    }),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    enabled: _options.enabled ?? true,
  })
}

/**
 * Stubbed usage limit update mutation - no-op.
 */
export function useUpdateUsageLimit() {
  return {
    mutate: (..._args: any[]) => {},
    mutateAsync: async (..._args: any[]) => ({}),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: undefined,
    reset: () => {},
  }
}

/**
 * Stubbed upgrade subscription mutation - no-op.
 */
export function useUpgradeSubscription() {
  return {
    mutate: (..._args: any[]) => {},
    mutateAsync: async (..._args: any[]) => ({}),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: undefined,
    reset: () => {},
  }
}
