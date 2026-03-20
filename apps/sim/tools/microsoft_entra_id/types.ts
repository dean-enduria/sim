import type { ToolResponse } from '@/tools/types'

// Base params shared by all Microsoft Entra ID tools
export interface MicrosoftEntraIdBaseParams {
  accessToken: string
}

// --- User Management ---

export interface ListUsersParams extends MicrosoftEntraIdBaseParams {
  filter?: string
  select?: string
  top?: string
}

export interface ListUsersResponse extends ToolResponse {
  output: {
    users: Record<string, any>[]
    metadata: { count: number; nextLink?: string }
  }
}

export interface GetUserParams extends MicrosoftEntraIdBaseParams {
  userId: string
  select?: string
}

export interface GetUserResponse extends ToolResponse {
  output: {
    user: Record<string, any>
  }
}

export interface CreateUserParams extends MicrosoftEntraIdBaseParams {
  displayName: string
  mailNickname: string
  userPrincipalName: string
  password: string
  accountEnabled?: string
  forceChangePassword?: string
}

export interface CreateUserResponse extends ToolResponse {
  output: {
    user: Record<string, any>
    metadata: { userId: string }
  }
}

export interface UpdateUserParams extends MicrosoftEntraIdBaseParams {
  userId: string
  properties: Record<string, any>
}

export interface UpdateUserResponse extends ToolResponse {
  output: {
    success: boolean
    metadata: { userId: string }
  }
}

export interface DeleteUserParams extends MicrosoftEntraIdBaseParams {
  userId: string
}

export interface DeleteUserResponse extends ToolResponse {
  output: {
    success: boolean
    metadata: { userId: string }
  }
}

export interface EnableDisableUserParams extends MicrosoftEntraIdBaseParams {
  userId: string
  accountEnabled: string
}

export interface EnableDisableUserResponse extends ToolResponse {
  output: {
    success: boolean
    metadata: { userId: string; accountEnabled: boolean }
  }
}

export interface ResetPasswordParams extends MicrosoftEntraIdBaseParams {
  userId: string
  newPassword: string
  forceChangePassword?: string
}

export interface ResetPasswordResponse extends ToolResponse {
  output: {
    success: boolean
    metadata: { userId: string }
  }
}

export interface ListUserGroupsParams extends MicrosoftEntraIdBaseParams {
  userId: string
}

export interface ListUserGroupsResponse extends ToolResponse {
  output: {
    groups: Record<string, any>[]
    metadata: { count: number }
  }
}

// --- Group Management ---

export interface ListGroupsParams extends MicrosoftEntraIdBaseParams {
  filter?: string
  select?: string
  top?: string
}

export interface ListGroupsResponse extends ToolResponse {
  output: {
    groups: Record<string, any>[]
    metadata: { count: number; nextLink?: string }
  }
}

export interface GetGroupParams extends MicrosoftEntraIdBaseParams {
  groupId: string
  select?: string
}

export interface GetGroupResponse extends ToolResponse {
  output: {
    group: Record<string, any>
  }
}

export interface CreateGroupParams extends MicrosoftEntraIdBaseParams {
  displayName: string
  description?: string
  mailNickname: string
  groupType: string
  mailEnabled?: string
}

export interface CreateGroupResponse extends ToolResponse {
  output: {
    group: Record<string, any>
    metadata: { groupId: string }
  }
}

export interface DeleteGroupParams extends MicrosoftEntraIdBaseParams {
  groupId: string
}

export interface DeleteGroupResponse extends ToolResponse {
  output: {
    success: boolean
    metadata: { groupId: string }
  }
}

export interface AddGroupMemberParams extends MicrosoftEntraIdBaseParams {
  groupId: string
  memberId: string
}

export interface AddGroupMemberResponse extends ToolResponse {
  output: {
    success: boolean
    metadata: { groupId: string; memberId: string }
  }
}

export interface RemoveGroupMemberParams extends MicrosoftEntraIdBaseParams {
  groupId: string
  memberId: string
}

export interface RemoveGroupMemberResponse extends ToolResponse {
  output: {
    success: boolean
    metadata: { groupId: string; memberId: string }
  }
}

export interface ListGroupMembersParams extends MicrosoftEntraIdBaseParams {
  groupId: string
}

export interface ListGroupMembersResponse extends ToolResponse {
  output: {
    members: Record<string, any>[]
    metadata: { count: number }
  }
}

// --- Directory Roles ---

export interface ListRoleDefinitionsParams extends MicrosoftEntraIdBaseParams {
  filter?: string
}

export interface ListRoleDefinitionsResponse extends ToolResponse {
  output: {
    roles: Record<string, any>[]
    metadata: { count: number }
  }
}

export interface ListRoleAssignmentsParams extends MicrosoftEntraIdBaseParams {
  filter?: string
}

export interface ListRoleAssignmentsResponse extends ToolResponse {
  output: {
    assignments: Record<string, any>[]
    metadata: { count: number }
  }
}

export interface CreateRoleAssignmentParams extends MicrosoftEntraIdBaseParams {
  roleDefinitionId: string
  principalId: string
  directoryScopeId?: string
}

export interface CreateRoleAssignmentResponse extends ToolResponse {
  output: {
    assignment: Record<string, any>
    metadata: { assignmentId: string }
  }
}

export interface RemoveRoleAssignmentParams extends MicrosoftEntraIdBaseParams {
  assignmentId: string
}

export interface RemoveRoleAssignmentResponse extends ToolResponse {
  output: {
    success: boolean
    metadata: { assignmentId: string }
  }
}

// --- Device Management ---

export interface ListDevicesParams extends MicrosoftEntraIdBaseParams {
  filter?: string
  select?: string
  top?: string
}

export interface ListDevicesResponse extends ToolResponse {
  output: {
    devices: Record<string, any>[]
    metadata: { count: number; nextLink?: string }
  }
}

export interface GetDeviceParams extends MicrosoftEntraIdBaseParams {
  deviceId: string
  select?: string
}

export interface GetDeviceResponse extends ToolResponse {
  output: {
    device: Record<string, any>
  }
}

export interface EnableDisableDeviceParams extends MicrosoftEntraIdBaseParams {
  deviceId: string
  accountEnabled: string
}

export interface EnableDisableDeviceResponse extends ToolResponse {
  output: {
    success: boolean
    metadata: { deviceId: string; accountEnabled: boolean }
  }
}

// Union type
export type MicrosoftEntraIdResponse =
  | ListUsersResponse
  | GetUserResponse
  | CreateUserResponse
  | UpdateUserResponse
  | DeleteUserResponse
  | EnableDisableUserResponse
  | ResetPasswordResponse
  | ListUserGroupsResponse
  | ListGroupsResponse
  | GetGroupResponse
  | CreateGroupResponse
  | DeleteGroupResponse
  | AddGroupMemberResponse
  | RemoveGroupMemberResponse
  | ListGroupMembersResponse
  | ListRoleDefinitionsResponse
  | ListRoleAssignmentsResponse
  | CreateRoleAssignmentResponse
  | RemoveRoleAssignmentResponse
  | ListDevicesResponse
  | GetDeviceResponse
  | EnableDisableDeviceResponse
