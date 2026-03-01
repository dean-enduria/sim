import { createLogger } from '@sim/logger'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
const logger = createLogger('OrganizationQueries')

/**
 * Query key factories for organization-related queries
 * This ensures consistent cache invalidation across the app
 */
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  subscription: (id: string) => [...organizationKeys.detail(id), 'subscription'] as const,
  billing: (id: string) => [...organizationKeys.detail(id), 'billing'] as const,
  members: (id: string) => [...organizationKeys.detail(id), 'members'] as const,
  memberUsage: (id: string) => [...organizationKeys.detail(id), 'member-usage'] as const,
}

/**
 * Stubbed - organizations are managed by Enduria.
 */
export function useOrganizations() {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: async () => ({
      organizations: [] as any[],
      activeOrganization: null as any,
    }),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })
}

/**
 * Stubbed - organizations are managed by Enduria.
 */
export function useOrganization(orgId: string) {
  return useQuery({
    queryKey: organizationKeys.detail(orgId),
    queryFn: async () => null as any,
    enabled: !!orgId,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })
}

/**
 * Stubbed - subscriptions are managed by Enduria.
 */
export function useOrganizationSubscription(orgId: string) {
  return useQuery({
    queryKey: organizationKeys.subscription(orgId),
    queryFn: async () => null as any,
    enabled: !!orgId,
    retry: false,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })
}

/**
 * Stubbed - billing is handled by Enduria.
 */
export function useOrganizationBilling(orgId: string) {
  return useQuery<any>({
    queryKey: organizationKeys.billing(orgId),
    queryFn: async () => ({
      data: {
        totalUsageLimit: 999999,
        usage: { current: 0, limit: 999999, percentUsed: 0 },
      },
    }),
    enabled: !!orgId,
    retry: false,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })
}

/**
 * Stubbed - organization members are managed by Enduria.
 */
export function useOrganizationMembers(orgId: string) {
  return useQuery({
    queryKey: organizationKeys.memberUsage(orgId),
    queryFn: async () => ({ members: [] as any[], data: [] as any[] }),
    enabled: !!orgId,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })
}

/**
 * Stubbed - billing is handled by Enduria.
 */
export function useUpdateOrganizationUsageLimit() {
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
 * Stubbed - invitations are managed by Enduria.
 */
interface InviteMemberParams {
  emails: string[]
  workspaceInvitations?: Array<{ workspaceId: string; permission: 'admin' | 'write' | 'read' }>
  orgId: string
}

export function useInviteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (_params: InviteMemberParams) => {
      logger.warn('useInviteMember is stubbed - organizations are managed by Enduria')
      return { success: true }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.orgId) })
    },
  })
}

/**
 * Stubbed - member management is handled by Enduria.
 */
interface RemoveMemberParams {
  memberId: string
  orgId: string
  shouldReduceSeats?: boolean
}

export function useRemoveMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (_params: RemoveMemberParams) => {
      logger.warn('useRemoveMember is stubbed - organizations are managed by Enduria')
      return { success: true }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.orgId) })
    },
  })
}

/**
 * Stubbed - invitations are managed by Enduria.
 */
interface CancelInvitationParams {
  invitationId: string
  orgId: string
}

export function useCancelInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (_params: CancelInvitationParams) => {
      logger.warn('useCancelInvitation is stubbed - organizations are managed by Enduria')
      return { success: true }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.orgId) })
    },
  })
}

/**
 * Stubbed - invitations are managed by Enduria.
 */
interface ResendInvitationParams {
  invitationId: string
  orgId: string
}

export function useResendInvitation() {
  return useMutation({
    mutationFn: async (_params: ResendInvitationParams) => {
      logger.warn('useResendInvitation is stubbed - organizations are managed by Enduria')
      return { success: true }
    },
  })
}

/**
 * Stubbed - seats are managed by Enduria.
 */
interface UpdateSeatsParams {
  orgId: string
  seats: number
}

export function useUpdateSeats() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (_params: UpdateSeatsParams) => {
      logger.warn('useUpdateSeats is stubbed - organizations are managed by Enduria')
      return { success: true }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.orgId) })
    },
  })
}

/**
 * Stubbed - organization settings are managed by Enduria.
 */
interface UpdateOrganizationParams {
  orgId: string
  name?: string
  slug?: string
  logo?: string | null
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (_params: UpdateOrganizationParams) => {
      logger.warn('useUpdateOrganization is stubbed - organizations are managed by Enduria')
      return { success: true }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.orgId) })
    },
  })
}

/**
 * Stubbed - organization creation is managed by Enduria.
 */
interface CreateOrganizationParams {
  name: string
  slug?: string
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (_params: CreateOrganizationParams) => {
      logger.warn('useCreateOrganization is stubbed - organizations are managed by Enduria')
      return { id: 'stub', name: _params.name }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all })
    },
  })
}
