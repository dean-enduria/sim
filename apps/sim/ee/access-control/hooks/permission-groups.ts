'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PermissionGroupConfig } from '@/lib/permission-groups/types'

export interface PermissionGroup {
  id: string
  name: string
  description: string | null
  config: PermissionGroupConfig
  createdBy: string
  createdAt: string
  updatedAt: string
  creatorName: string | null
  creatorEmail: string | null
  memberCount: number
  autoAddNewMembers: boolean
}

export interface PermissionGroupMember {
  id: string
  userId: string
  assignedAt: string
  userName: string | null
  userEmail: string | null
  userImage: string | null
}

export interface UserPermissionConfig {
  permissionGroupId: string | null
  groupName: string | null
  config: PermissionGroupConfig | null
}

export const permissionGroupKeys = {
  all: ['permissionGroups'] as const,
  list: (organizationId?: string) =>
    ['permissionGroups', 'list', organizationId ?? 'none'] as const,
  detail: (id?: string) => ['permissionGroups', 'detail', id ?? 'none'] as const,
  members: (id?: string) => ['permissionGroups', 'members', id ?? 'none'] as const,
  userConfig: (organizationId?: string) =>
    ['permissionGroups', 'userConfig', organizationId ?? 'none'] as const,
}

// All permission group hooks are stubbed - permissions are managed by Enduria.

export function usePermissionGroups(organizationId?: string, enabled = true) {
  return useQuery<PermissionGroup[]>({
    queryKey: permissionGroupKeys.list(organizationId),
    queryFn: async () => [],
    enabled: Boolean(organizationId) && enabled,
    staleTime: Infinity,
  })
}

export function usePermissionGroup(id?: string, enabled = true) {
  return useQuery<PermissionGroup | null>({
    queryKey: permissionGroupKeys.detail(id),
    queryFn: async () => null,
    enabled: Boolean(id) && enabled,
    staleTime: Infinity,
  })
}

export function usePermissionGroupMembers(permissionGroupId?: string) {
  return useQuery<PermissionGroupMember[]>({
    queryKey: permissionGroupKeys.members(permissionGroupId),
    queryFn: async () => [],
    enabled: Boolean(permissionGroupId),
    staleTime: Infinity,
  })
}

export function useUserPermissionConfig(organizationId?: string) {
  return useQuery<UserPermissionConfig>({
    queryKey: permissionGroupKeys.userConfig(organizationId),
    queryFn: async () => ({
      permissionGroupId: null,
      groupName: null,
      config: null,
    }),
    enabled: Boolean(organizationId),
    staleTime: Infinity,
  })
}

export interface CreatePermissionGroupData {
  organizationId: string
  name: string
  description?: string
  config?: Partial<PermissionGroupConfig>
  autoAddNewMembers?: boolean
}

export function useCreatePermissionGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_data: CreatePermissionGroupData) => ({ success: true }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: permissionGroupKeys.list(variables.organizationId),
      })
    },
  })
}

export interface UpdatePermissionGroupData {
  id: string
  organizationId: string
  name?: string
  description?: string | null
  config?: Partial<PermissionGroupConfig>
  autoAddNewMembers?: boolean
}

export function useUpdatePermissionGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_data: UpdatePermissionGroupData) => ({ success: true }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: permissionGroupKeys.list(variables.organizationId),
      })
    },
  })
}

export interface DeletePermissionGroupParams {
  permissionGroupId: string
  organizationId: string
}

export function useDeletePermissionGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_params: DeletePermissionGroupParams) => ({ success: true }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: permissionGroupKeys.list(variables.organizationId),
      })
    },
  })
}

export function useAddPermissionGroupMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_data: { permissionGroupId: string; userId: string }) => ({ success: true }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: permissionGroupKeys.members(variables.permissionGroupId),
      })
    },
  })
}

export function useRemovePermissionGroupMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_data: { permissionGroupId: string; memberId: string }) => ({
      success: true,
    }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: permissionGroupKeys.members(variables.permissionGroupId),
      })
    },
  })
}

export interface BulkAddMembersData {
  permissionGroupId: string
  userIds?: string[]
  addAllOrgMembers?: boolean
}

export function useBulkAddPermissionGroupMembers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_data: BulkAddMembersData) => ({ added: 0, moved: 0 }) as {
      added: number
      moved: number
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: permissionGroupKeys.members(variables.permissionGroupId),
      })
    },
  })
}
