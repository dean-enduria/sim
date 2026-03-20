# Microsoft Entra ID Block Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a SIM block that enables workflow automations with Microsoft Entra ID (users, groups, directory roles, devices) via Microsoft Graph API v1.0.

**Architecture:** Single `microsoft_entra_id` block with 22 operations dispatched via dropdown. Each operation maps to a dedicated `ToolConfig` handler that makes direct HTTP requests to `https://graph.microsoft.com/v1.0/`. Authentication uses a new `microsoft-entra-id` OAuth service that shares the existing `MICROSOFT_CLIENT_ID`/`MICROSOFT_CLIENT_SECRET` credentials but requests directory-level scopes.

**Tech Stack:** TypeScript, Next.js App Router, Microsoft Graph API v1.0, OAuth 2.0

---

### Task 1: Create Types File

**Files:**
- Create: `tools/microsoft_entra_id/types.ts`

**Step 1: Write the types file**

```typescript
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
```

**Step 2: Commit**

```bash
git add tools/microsoft_entra_id/types.ts
git commit -m "feat(entra-id): add type definitions for Microsoft Entra ID tools"
```

---

### Task 2: Create User Management Tool Handlers (8 tools)

**Files:**
- Create: `tools/microsoft_entra_id/list_users.ts`
- Create: `tools/microsoft_entra_id/get_user.ts`
- Create: `tools/microsoft_entra_id/create_user.ts`
- Create: `tools/microsoft_entra_id/update_user.ts`
- Create: `tools/microsoft_entra_id/delete_user.ts`
- Create: `tools/microsoft_entra_id/enable_disable_user.ts`
- Create: `tools/microsoft_entra_id/reset_password.ts`
- Create: `tools/microsoft_entra_id/list_user_groups.ts`

**Step 1: Create list_users.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { ListUsersParams, ListUsersResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdListUsers')

export const listUsersTool: ToolConfig<ListUsersParams, ListUsersResponse> = {
  id: 'microsoft_entra_id_list_users',
  name: 'List Entra ID Users',
  description: 'List users in Microsoft Entra ID directory',
  version: '1.0.0',

  oauth: {
    required: true,
    provider: 'microsoft-entra-id',
  },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    filter: { type: 'string', required: false, visibility: 'user-or-llm', description: 'OData filter expression (e.g. startsWith(displayName,\'John\'))' },
    select: { type: 'string', required: false, visibility: 'user-or-llm', description: 'Comma-separated properties to return (e.g. id,displayName,mail)' },
    top: { type: 'string', required: false, visibility: 'user-or-llm', description: 'Maximum number of results to return' },
  },

  request: {
    url: (params) => {
      const query = new URLSearchParams()
      if (params.filter) query.set('$filter', params.filter)
      if (params.select) query.set('$select', params.select)
      if (params.top) query.set('$top', params.top)
      const qs = query.toString()
      return `https://graph.microsoft.com/v1.0/users${qs ? `?${qs}` : ''}`
    },
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error?.message || JSON.stringify(data))
    }
    const users = data.value || []
    return {
      success: true,
      output: {
        users,
        metadata: { count: users.length, nextLink: data['@odata.nextLink'] },
      },
    }
  },

  outputs: {
    users: { type: 'json', description: 'Array of Entra ID user objects' },
    metadata: { type: 'json', description: 'Result metadata including count and pagination link' },
  },
}
```

**Step 2: Create get_user.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { GetUserParams, GetUserResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdGetUser')

export const getUserTool: ToolConfig<GetUserParams, GetUserResponse> = {
  id: 'microsoft_entra_id_get_user',
  name: 'Get Entra ID User',
  description: 'Get a specific user from Microsoft Entra ID by ID or UPN',
  version: '1.0.0',

  oauth: {
    required: true,
    provider: 'microsoft-entra-id',
  },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    userId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'User ID or userPrincipalName' },
    select: { type: 'string', required: false, visibility: 'user-or-llm', description: 'Comma-separated properties to return' },
  },

  request: {
    url: (params) => {
      const query = new URLSearchParams()
      if (params.select) query.set('$select', params.select)
      const qs = query.toString()
      return `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(params.userId)}${qs ? `?${qs}` : ''}`
    },
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error?.message || JSON.stringify(data))
    }
    return {
      success: true,
      output: { user: data },
    }
  },

  outputs: {
    user: { type: 'json', description: 'Entra ID user object' },
  },
}
```

**Step 3: Create create_user.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { CreateUserParams, CreateUserResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdCreateUser')

export const createUserTool: ToolConfig<CreateUserParams, CreateUserResponse> = {
  id: 'microsoft_entra_id_create_user',
  name: 'Create Entra ID User',
  description: 'Create a new user in Microsoft Entra ID',
  version: '1.0.0',

  oauth: {
    required: true,
    provider: 'microsoft-entra-id',
  },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    displayName: { type: 'string', required: true, visibility: 'user-or-llm', description: 'User display name' },
    mailNickname: { type: 'string', required: true, visibility: 'user-or-llm', description: 'Mail alias for the user' },
    userPrincipalName: { type: 'string', required: true, visibility: 'user-or-llm', description: 'User principal name (e.g. user@contoso.com)' },
    password: { type: 'string', required: true, visibility: 'user-or-llm', description: 'Initial password for the user' },
    accountEnabled: { type: 'string', required: false, visibility: 'user-or-llm', description: 'Whether the account is enabled (true/false)' },
    forceChangePassword: { type: 'string', required: false, visibility: 'user-or-llm', description: 'Force password change on next sign-in (true/false)' },
  },

  request: {
    url: () => 'https://graph.microsoft.com/v1.0/users',
    method: 'POST',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      accountEnabled: params.accountEnabled !== 'false',
      displayName: params.displayName,
      mailNickname: params.mailNickname,
      userPrincipalName: params.userPrincipalName,
      passwordProfile: {
        forceChangePasswordNextSignIn: params.forceChangePassword !== 'false',
        password: params.password,
      },
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error?.message || JSON.stringify(data))
    }
    return {
      success: true,
      output: {
        user: data,
        metadata: { userId: data.id },
      },
    }
  },

  outputs: {
    user: { type: 'json', description: 'Created Entra ID user object' },
    metadata: { type: 'json', description: 'Operation metadata including user ID' },
  },
}
```

**Step 4: Create update_user.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { UpdateUserParams, UpdateUserResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdUpdateUser')

export const updateUserTool: ToolConfig<UpdateUserParams, UpdateUserResponse> = {
  id: 'microsoft_entra_id_update_user',
  name: 'Update Entra ID User',
  description: 'Update properties of a user in Microsoft Entra ID',
  version: '1.0.0',

  oauth: {
    required: true,
    provider: 'microsoft-entra-id',
  },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    userId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'User ID or userPrincipalName' },
    properties: { type: 'json', required: true, visibility: 'user-or-llm', description: 'JSON object of properties to update' },
  },

  request: {
    url: (params) => `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(params.userId)}`,
    method: 'PATCH',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params) => params.properties,
  },

  transformResponse: async (response, params) => {
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || JSON.stringify(data))
    }
    return {
      success: true,
      output: {
        success: true,
        metadata: { userId: params?.userId || '' },
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the update was successful' },
    metadata: { type: 'json', description: 'Operation metadata including user ID' },
  },
}
```

**Step 5: Create delete_user.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { DeleteUserParams, DeleteUserResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdDeleteUser')

export const deleteUserTool: ToolConfig<DeleteUserParams, DeleteUserResponse> = {
  id: 'microsoft_entra_id_delete_user',
  name: 'Delete Entra ID User',
  description: 'Delete a user from Microsoft Entra ID',
  version: '1.0.0',

  oauth: {
    required: true,
    provider: 'microsoft-entra-id',
  },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    userId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'User ID or userPrincipalName' },
  },

  request: {
    url: (params) => `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(params.userId)}`,
    method: 'DELETE',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response, params) => {
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || JSON.stringify(data))
    }
    return {
      success: true,
      output: {
        success: true,
        metadata: { userId: params?.userId || '' },
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the deletion was successful' },
    metadata: { type: 'json', description: 'Operation metadata including user ID' },
  },
}
```

**Step 6: Create enable_disable_user.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { EnableDisableUserParams, EnableDisableUserResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdEnableDisableUser')

export const enableDisableUserTool: ToolConfig<EnableDisableUserParams, EnableDisableUserResponse> = {
  id: 'microsoft_entra_id_enable_disable_user',
  name: 'Enable/Disable Entra ID User',
  description: 'Enable or disable a user account in Microsoft Entra ID',
  version: '1.0.0',

  oauth: {
    required: true,
    provider: 'microsoft-entra-id',
  },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    userId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'User ID or userPrincipalName' },
    accountEnabled: { type: 'string', required: true, visibility: 'user-or-llm', description: 'true to enable, false to disable' },
  },

  request: {
    url: (params) => `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(params.userId)}`,
    method: 'PATCH',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      accountEnabled: params.accountEnabled === 'true',
    }),
  },

  transformResponse: async (response, params) => {
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || JSON.stringify(data))
    }
    const enabled = params?.accountEnabled === 'true'
    return {
      success: true,
      output: {
        success: true,
        metadata: { userId: params?.userId || '', accountEnabled: enabled },
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    metadata: { type: 'json', description: 'Operation metadata' },
  },
}
```

**Step 7: Create reset_password.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { ResetPasswordParams, ResetPasswordResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdResetPassword')

export const resetPasswordTool: ToolConfig<ResetPasswordParams, ResetPasswordResponse> = {
  id: 'microsoft_entra_id_reset_password',
  name: 'Reset Entra ID User Password',
  description: 'Reset a user\'s password in Microsoft Entra ID',
  version: '1.0.0',

  oauth: {
    required: true,
    provider: 'microsoft-entra-id',
  },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    userId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'User ID or userPrincipalName' },
    newPassword: { type: 'string', required: true, visibility: 'user-or-llm', description: 'New password for the user' },
    forceChangePassword: { type: 'string', required: false, visibility: 'user-or-llm', description: 'Force password change on next sign-in (true/false)' },
  },

  request: {
    url: (params) => `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(params.userId)}`,
    method: 'PATCH',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      passwordProfile: {
        forceChangePasswordNextSignIn: params.forceChangePassword !== 'false',
        password: params.newPassword,
      },
    }),
  },

  transformResponse: async (response, params) => {
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || JSON.stringify(data))
    }
    return {
      success: true,
      output: {
        success: true,
        metadata: { userId: params?.userId || '' },
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the password reset was successful' },
    metadata: { type: 'json', description: 'Operation metadata including user ID' },
  },
}
```

**Step 8: Create list_user_groups.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { ListUserGroupsParams, ListUserGroupsResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdListUserGroups')

export const listUserGroupsTool: ToolConfig<ListUserGroupsParams, ListUserGroupsResponse> = {
  id: 'microsoft_entra_id_list_user_groups',
  name: 'List User Group Memberships',
  description: 'List all groups a user is a member of in Microsoft Entra ID',
  version: '1.0.0',

  oauth: {
    required: true,
    provider: 'microsoft-entra-id',
  },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    userId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'User ID or userPrincipalName' },
  },

  request: {
    url: (params) => `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(params.userId)}/memberOf`,
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error?.message || JSON.stringify(data))
    }
    const groups = (data.value || []).filter(
      (item: any) => item['@odata.type'] === '#microsoft.graph.group'
    )
    return {
      success: true,
      output: {
        groups,
        metadata: { count: groups.length },
      },
    }
  },

  outputs: {
    groups: { type: 'json', description: 'Array of groups the user belongs to' },
    metadata: { type: 'json', description: 'Result metadata including count' },
  },
}
```

**Step 9: Commit**

```bash
git add tools/microsoft_entra_id/list_users.ts tools/microsoft_entra_id/get_user.ts tools/microsoft_entra_id/create_user.ts tools/microsoft_entra_id/update_user.ts tools/microsoft_entra_id/delete_user.ts tools/microsoft_entra_id/enable_disable_user.ts tools/microsoft_entra_id/reset_password.ts tools/microsoft_entra_id/list_user_groups.ts
git commit -m "feat(entra-id): add user management tool handlers"
```

---

### Task 3: Create Group Management Tool Handlers (7 tools)

**Files:**
- Create: `tools/microsoft_entra_id/list_groups.ts`
- Create: `tools/microsoft_entra_id/get_group.ts`
- Create: `tools/microsoft_entra_id/create_group.ts`
- Create: `tools/microsoft_entra_id/delete_group.ts`
- Create: `tools/microsoft_entra_id/add_group_member.ts`
- Create: `tools/microsoft_entra_id/remove_group_member.ts`
- Create: `tools/microsoft_entra_id/list_group_members.ts`

**Step 1: Create list_groups.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { ListGroupsParams, ListGroupsResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdListGroups')

export const listGroupsTool: ToolConfig<ListGroupsParams, ListGroupsResponse> = {
  id: 'microsoft_entra_id_list_groups',
  name: 'List Entra ID Groups',
  description: 'List groups in Microsoft Entra ID directory',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    filter: { type: 'string', required: false, visibility: 'user-or-llm', description: 'OData filter expression' },
    select: { type: 'string', required: false, visibility: 'user-or-llm', description: 'Comma-separated properties to return' },
    top: { type: 'string', required: false, visibility: 'user-or-llm', description: 'Maximum number of results' },
  },

  request: {
    url: (params) => {
      const query = new URLSearchParams()
      if (params.filter) query.set('$filter', params.filter)
      if (params.select) query.set('$select', params.select)
      if (params.top) query.set('$top', params.top)
      const qs = query.toString()
      return `https://graph.microsoft.com/v1.0/groups${qs ? `?${qs}` : ''}`
    },
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data))
    const groups = data.value || []
    return {
      success: true,
      output: { groups, metadata: { count: groups.length, nextLink: data['@odata.nextLink'] } },
    }
  },

  outputs: {
    groups: { type: 'json', description: 'Array of Entra ID group objects' },
    metadata: { type: 'json', description: 'Result metadata' },
  },
}
```

**Step 2: Create get_group.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { GetGroupParams, GetGroupResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdGetGroup')

export const getGroupTool: ToolConfig<GetGroupParams, GetGroupResponse> = {
  id: 'microsoft_entra_id_get_group',
  name: 'Get Entra ID Group',
  description: 'Get a specific group from Microsoft Entra ID',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    groupId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'Group ID' },
    select: { type: 'string', required: false, visibility: 'user-or-llm', description: 'Comma-separated properties to return' },
  },

  request: {
    url: (params) => {
      const query = new URLSearchParams()
      if (params.select) query.set('$select', params.select)
      const qs = query.toString()
      return `https://graph.microsoft.com/v1.0/groups/${encodeURIComponent(params.groupId)}${qs ? `?${qs}` : ''}`
    },
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data))
    return { success: true, output: { group: data } }
  },

  outputs: {
    group: { type: 'json', description: 'Entra ID group object' },
  },
}
```

**Step 3: Create create_group.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { CreateGroupParams, CreateGroupResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdCreateGroup')

export const createGroupTool: ToolConfig<CreateGroupParams, CreateGroupResponse> = {
  id: 'microsoft_entra_id_create_group',
  name: 'Create Entra ID Group',
  description: 'Create a new security or Microsoft 365 group in Entra ID',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    displayName: { type: 'string', required: true, visibility: 'user-or-llm', description: 'Group display name' },
    description: { type: 'string', required: false, visibility: 'user-or-llm', description: 'Group description' },
    mailNickname: { type: 'string', required: true, visibility: 'user-or-llm', description: 'Mail alias for the group' },
    groupType: { type: 'string', required: true, visibility: 'user-or-llm', description: 'Group type: security or microsoft365' },
    mailEnabled: { type: 'string', required: false, visibility: 'user-or-llm', description: 'Whether the group is mail-enabled (true/false)' },
  },

  request: {
    url: () => 'https://graph.microsoft.com/v1.0/groups',
    method: 'POST',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params) => {
      const isMicrosoft365 = params.groupType === 'microsoft365'
      return {
        displayName: params.displayName,
        ...(params.description && { description: params.description }),
        mailNickname: params.mailNickname,
        mailEnabled: isMicrosoft365 || params.mailEnabled === 'true',
        securityEnabled: !isMicrosoft365,
        groupTypes: isMicrosoft365 ? ['Unified'] : [],
      }
    },
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data))
    return {
      success: true,
      output: { group: data, metadata: { groupId: data.id } },
    }
  },

  outputs: {
    group: { type: 'json', description: 'Created Entra ID group object' },
    metadata: { type: 'json', description: 'Operation metadata including group ID' },
  },
}
```

**Step 4: Create delete_group.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { DeleteGroupParams, DeleteGroupResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdDeleteGroup')

export const deleteGroupTool: ToolConfig<DeleteGroupParams, DeleteGroupResponse> = {
  id: 'microsoft_entra_id_delete_group',
  name: 'Delete Entra ID Group',
  description: 'Delete a group from Microsoft Entra ID',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    groupId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'Group ID to delete' },
  },

  request: {
    url: (params) => `https://graph.microsoft.com/v1.0/groups/${encodeURIComponent(params.groupId)}`,
    method: 'DELETE',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response, params) => {
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || JSON.stringify(data))
    }
    return {
      success: true,
      output: { success: true, metadata: { groupId: params?.groupId || '' } },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the deletion was successful' },
    metadata: { type: 'json', description: 'Operation metadata' },
  },
}
```

**Step 5: Create add_group_member.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { AddGroupMemberParams, AddGroupMemberResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdAddGroupMember')

export const addGroupMemberTool: ToolConfig<AddGroupMemberParams, AddGroupMemberResponse> = {
  id: 'microsoft_entra_id_add_group_member',
  name: 'Add Member to Entra ID Group',
  description: 'Add a user or service principal as a member of an Entra ID group',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    groupId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'Group ID' },
    memberId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'User or service principal ID to add' },
  },

  request: {
    url: (params) => `https://graph.microsoft.com/v1.0/groups/${encodeURIComponent(params.groupId)}/members/$ref`,
    method: 'POST',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      '@odata.id': `https://graph.microsoft.com/v1.0/directoryObjects/${params.memberId}`,
    }),
  },

  transformResponse: async (response, params) => {
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || JSON.stringify(data))
    }
    return {
      success: true,
      output: {
        success: true,
        metadata: { groupId: params?.groupId || '', memberId: params?.memberId || '' },
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the member was added successfully' },
    metadata: { type: 'json', description: 'Operation metadata' },
  },
}
```

**Step 6: Create remove_group_member.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { RemoveGroupMemberParams, RemoveGroupMemberResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdRemoveGroupMember')

export const removeGroupMemberTool: ToolConfig<RemoveGroupMemberParams, RemoveGroupMemberResponse> = {
  id: 'microsoft_entra_id_remove_group_member',
  name: 'Remove Member from Entra ID Group',
  description: 'Remove a member from an Entra ID group',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    groupId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'Group ID' },
    memberId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'Member ID to remove' },
  },

  request: {
    url: (params) =>
      `https://graph.microsoft.com/v1.0/groups/${encodeURIComponent(params.groupId)}/members/${encodeURIComponent(params.memberId)}/$ref`,
    method: 'DELETE',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response, params) => {
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || JSON.stringify(data))
    }
    return {
      success: true,
      output: {
        success: true,
        metadata: { groupId: params?.groupId || '', memberId: params?.memberId || '' },
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the member was removed successfully' },
    metadata: { type: 'json', description: 'Operation metadata' },
  },
}
```

**Step 7: Create list_group_members.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { ListGroupMembersParams, ListGroupMembersResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdListGroupMembers')

export const listGroupMembersTool: ToolConfig<ListGroupMembersParams, ListGroupMembersResponse> = {
  id: 'microsoft_entra_id_list_group_members',
  name: 'List Entra ID Group Members',
  description: 'List all members of an Entra ID group',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    groupId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'Group ID' },
  },

  request: {
    url: (params) => `https://graph.microsoft.com/v1.0/groups/${encodeURIComponent(params.groupId)}/members`,
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data))
    const members = data.value || []
    return {
      success: true,
      output: { members, metadata: { count: members.length } },
    }
  },

  outputs: {
    members: { type: 'json', description: 'Array of group member objects' },
    metadata: { type: 'json', description: 'Result metadata including count' },
  },
}
```

**Step 8: Commit**

```bash
git add tools/microsoft_entra_id/list_groups.ts tools/microsoft_entra_id/get_group.ts tools/microsoft_entra_id/create_group.ts tools/microsoft_entra_id/delete_group.ts tools/microsoft_entra_id/add_group_member.ts tools/microsoft_entra_id/remove_group_member.ts tools/microsoft_entra_id/list_group_members.ts
git commit -m "feat(entra-id): add group management tool handlers"
```

---

### Task 4: Create Directory Role Tool Handlers (4 tools)

**Files:**
- Create: `tools/microsoft_entra_id/list_role_definitions.ts`
- Create: `tools/microsoft_entra_id/list_role_assignments.ts`
- Create: `tools/microsoft_entra_id/create_role_assignment.ts`
- Create: `tools/microsoft_entra_id/remove_role_assignment.ts`

**Step 1: Create list_role_definitions.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { ListRoleDefinitionsParams, ListRoleDefinitionsResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdListRoleDefinitions')

export const listRoleDefinitionsTool: ToolConfig<ListRoleDefinitionsParams, ListRoleDefinitionsResponse> = {
  id: 'microsoft_entra_id_list_role_definitions',
  name: 'List Entra ID Role Definitions',
  description: 'List directory role definitions in Microsoft Entra ID',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    filter: { type: 'string', required: false, visibility: 'user-or-llm', description: 'OData filter expression' },
  },

  request: {
    url: (params) => {
      const query = new URLSearchParams()
      if (params.filter) query.set('$filter', params.filter)
      const qs = query.toString()
      return `https://graph.microsoft.com/v1.0/roleManagement/directory/roleDefinitions${qs ? `?${qs}` : ''}`
    },
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data))
    const roles = data.value || []
    return { success: true, output: { roles, metadata: { count: roles.length } } }
  },

  outputs: {
    roles: { type: 'json', description: 'Array of role definition objects' },
    metadata: { type: 'json', description: 'Result metadata' },
  },
}
```

**Step 2: Create list_role_assignments.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { ListRoleAssignmentsParams, ListRoleAssignmentsResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdListRoleAssignments')

export const listRoleAssignmentsTool: ToolConfig<ListRoleAssignmentsParams, ListRoleAssignmentsResponse> = {
  id: 'microsoft_entra_id_list_role_assignments',
  name: 'List Entra ID Role Assignments',
  description: 'List directory role assignments in Microsoft Entra ID',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    filter: { type: 'string', required: false, visibility: 'user-or-llm', description: 'OData filter (e.g. principalId eq \'userId\')' },
  },

  request: {
    url: (params) => {
      const query = new URLSearchParams()
      if (params.filter) query.set('$filter', params.filter)
      const qs = query.toString()
      return `https://graph.microsoft.com/v1.0/roleManagement/directory/roleAssignments${qs ? `?${qs}` : ''}`
    },
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data))
    const assignments = data.value || []
    return { success: true, output: { assignments, metadata: { count: assignments.length } } }
  },

  outputs: {
    assignments: { type: 'json', description: 'Array of role assignment objects' },
    metadata: { type: 'json', description: 'Result metadata' },
  },
}
```

**Step 3: Create create_role_assignment.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { CreateRoleAssignmentParams, CreateRoleAssignmentResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdCreateRoleAssignment')

export const createRoleAssignmentTool: ToolConfig<CreateRoleAssignmentParams, CreateRoleAssignmentResponse> = {
  id: 'microsoft_entra_id_create_role_assignment',
  name: 'Create Entra ID Role Assignment',
  description: 'Assign a directory role to a user or service principal',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    roleDefinitionId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'Role definition ID to assign' },
    principalId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'User or service principal ID to assign the role to' },
    directoryScopeId: { type: 'string', required: false, visibility: 'user-or-llm', description: 'Directory scope (defaults to / for tenant-wide)' },
  },

  request: {
    url: () => 'https://graph.microsoft.com/v1.0/roleManagement/directory/roleAssignments',
    method: 'POST',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      roleDefinitionId: params.roleDefinitionId,
      principalId: params.principalId,
      directoryScopeId: params.directoryScopeId || '/',
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data))
    return {
      success: true,
      output: { assignment: data, metadata: { assignmentId: data.id } },
    }
  },

  outputs: {
    assignment: { type: 'json', description: 'Created role assignment object' },
    metadata: { type: 'json', description: 'Operation metadata including assignment ID' },
  },
}
```

**Step 4: Create remove_role_assignment.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { RemoveRoleAssignmentParams, RemoveRoleAssignmentResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdRemoveRoleAssignment')

export const removeRoleAssignmentTool: ToolConfig<RemoveRoleAssignmentParams, RemoveRoleAssignmentResponse> = {
  id: 'microsoft_entra_id_remove_role_assignment',
  name: 'Remove Entra ID Role Assignment',
  description: 'Remove a directory role assignment',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    assignmentId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'Role assignment ID to remove' },
  },

  request: {
    url: (params) =>
      `https://graph.microsoft.com/v1.0/roleManagement/directory/roleAssignments/${encodeURIComponent(params.assignmentId)}`,
    method: 'DELETE',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response, params) => {
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || JSON.stringify(data))
    }
    return {
      success: true,
      output: { success: true, metadata: { assignmentId: params?.assignmentId || '' } },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the removal was successful' },
    metadata: { type: 'json', description: 'Operation metadata' },
  },
}
```

**Step 5: Commit**

```bash
git add tools/microsoft_entra_id/list_role_definitions.ts tools/microsoft_entra_id/list_role_assignments.ts tools/microsoft_entra_id/create_role_assignment.ts tools/microsoft_entra_id/remove_role_assignment.ts
git commit -m "feat(entra-id): add directory role tool handlers"
```

---

### Task 5: Create Device Management Tool Handlers (3 tools)

**Files:**
- Create: `tools/microsoft_entra_id/list_devices.ts`
- Create: `tools/microsoft_entra_id/get_device.ts`
- Create: `tools/microsoft_entra_id/enable_disable_device.ts`

**Step 1: Create list_devices.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { ListDevicesParams, ListDevicesResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdListDevices')

export const listDevicesTool: ToolConfig<ListDevicesParams, ListDevicesResponse> = {
  id: 'microsoft_entra_id_list_devices',
  name: 'List Entra ID Devices',
  description: 'List registered devices in Microsoft Entra ID',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    filter: { type: 'string', required: false, visibility: 'user-or-llm', description: 'OData filter expression' },
    select: { type: 'string', required: false, visibility: 'user-or-llm', description: 'Comma-separated properties to return' },
    top: { type: 'string', required: false, visibility: 'user-or-llm', description: 'Maximum number of results' },
  },

  request: {
    url: (params) => {
      const query = new URLSearchParams()
      if (params.filter) query.set('$filter', params.filter)
      if (params.select) query.set('$select', params.select)
      if (params.top) query.set('$top', params.top)
      const qs = query.toString()
      return `https://graph.microsoft.com/v1.0/devices${qs ? `?${qs}` : ''}`
    },
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data))
    const devices = data.value || []
    return {
      success: true,
      output: { devices, metadata: { count: devices.length, nextLink: data['@odata.nextLink'] } },
    }
  },

  outputs: {
    devices: { type: 'json', description: 'Array of Entra ID device objects' },
    metadata: { type: 'json', description: 'Result metadata' },
  },
}
```

**Step 2: Create get_device.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { GetDeviceParams, GetDeviceResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdGetDevice')

export const getDeviceTool: ToolConfig<GetDeviceParams, GetDeviceResponse> = {
  id: 'microsoft_entra_id_get_device',
  name: 'Get Entra ID Device',
  description: 'Get a specific device from Microsoft Entra ID',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    deviceId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'Device ID' },
    select: { type: 'string', required: false, visibility: 'user-or-llm', description: 'Comma-separated properties to return' },
  },

  request: {
    url: (params) => {
      const query = new URLSearchParams()
      if (params.select) query.set('$select', params.select)
      const qs = query.toString()
      return `https://graph.microsoft.com/v1.0/devices/${encodeURIComponent(params.deviceId)}${qs ? `?${qs}` : ''}`
    },
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response) => {
    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data))
    return { success: true, output: { device: data } }
  },

  outputs: {
    device: { type: 'json', description: 'Entra ID device object' },
  },
}
```

**Step 3: Create enable_disable_device.ts**

```typescript
import { createLogger } from '@sim/logger'
import type { EnableDisableDeviceParams, EnableDisableDeviceResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdEnableDisableDevice')

export const enableDisableDeviceTool: ToolConfig<EnableDisableDeviceParams, EnableDisableDeviceResponse> = {
  id: 'microsoft_entra_id_enable_disable_device',
  name: 'Enable/Disable Entra ID Device',
  description: 'Enable or disable a device in Microsoft Entra ID',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden', description: 'OAuth access token' },
    deviceId: { type: 'string', required: true, visibility: 'user-or-llm', description: 'Device ID' },
    accountEnabled: { type: 'string', required: true, visibility: 'user-or-llm', description: 'true to enable, false to disable' },
  },

  request: {
    url: (params) => `https://graph.microsoft.com/v1.0/devices/${encodeURIComponent(params.deviceId)}`,
    method: 'PATCH',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      accountEnabled: params.accountEnabled === 'true',
    }),
  },

  transformResponse: async (response, params) => {
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || JSON.stringify(data))
    }
    return {
      success: true,
      output: {
        success: true,
        metadata: { deviceId: params?.deviceId || '', accountEnabled: params?.accountEnabled === 'true' },
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    metadata: { type: 'json', description: 'Operation metadata' },
  },
}
```

**Step 4: Commit**

```bash
git add tools/microsoft_entra_id/list_devices.ts tools/microsoft_entra_id/get_device.ts tools/microsoft_entra_id/enable_disable_device.ts
git commit -m "feat(entra-id): add device management tool handlers"
```

---

### Task 6: Create Tool Barrel Export and Register in Tool Registry

**Files:**
- Create: `tools/microsoft_entra_id/index.ts`
- Modify: `tools/registry.ts`

**Step 1: Create index.ts barrel export**

```typescript
import { listUsersTool } from '@/tools/microsoft_entra_id/list_users'
import { getUserTool } from '@/tools/microsoft_entra_id/get_user'
import { createUserTool } from '@/tools/microsoft_entra_id/create_user'
import { updateUserTool } from '@/tools/microsoft_entra_id/update_user'
import { deleteUserTool } from '@/tools/microsoft_entra_id/delete_user'
import { enableDisableUserTool } from '@/tools/microsoft_entra_id/enable_disable_user'
import { resetPasswordTool } from '@/tools/microsoft_entra_id/reset_password'
import { listUserGroupsTool } from '@/tools/microsoft_entra_id/list_user_groups'
import { listGroupsTool } from '@/tools/microsoft_entra_id/list_groups'
import { getGroupTool } from '@/tools/microsoft_entra_id/get_group'
import { createGroupTool } from '@/tools/microsoft_entra_id/create_group'
import { deleteGroupTool } from '@/tools/microsoft_entra_id/delete_group'
import { addGroupMemberTool } from '@/tools/microsoft_entra_id/add_group_member'
import { removeGroupMemberTool } from '@/tools/microsoft_entra_id/remove_group_member'
import { listGroupMembersTool } from '@/tools/microsoft_entra_id/list_group_members'
import { listRoleDefinitionsTool } from '@/tools/microsoft_entra_id/list_role_definitions'
import { listRoleAssignmentsTool } from '@/tools/microsoft_entra_id/list_role_assignments'
import { createRoleAssignmentTool } from '@/tools/microsoft_entra_id/create_role_assignment'
import { removeRoleAssignmentTool } from '@/tools/microsoft_entra_id/remove_role_assignment'
import { listDevicesTool } from '@/tools/microsoft_entra_id/list_devices'
import { getDeviceTool } from '@/tools/microsoft_entra_id/get_device'
import { enableDisableDeviceTool } from '@/tools/microsoft_entra_id/enable_disable_device'

export {
  listUsersTool as microsoftEntraIdListUsersTool,
  getUserTool as microsoftEntraIdGetUserTool,
  createUserTool as microsoftEntraIdCreateUserTool,
  updateUserTool as microsoftEntraIdUpdateUserTool,
  deleteUserTool as microsoftEntraIdDeleteUserTool,
  enableDisableUserTool as microsoftEntraIdEnableDisableUserTool,
  resetPasswordTool as microsoftEntraIdResetPasswordTool,
  listUserGroupsTool as microsoftEntraIdListUserGroupsTool,
  listGroupsTool as microsoftEntraIdListGroupsTool,
  getGroupTool as microsoftEntraIdGetGroupTool,
  createGroupTool as microsoftEntraIdCreateGroupTool,
  deleteGroupTool as microsoftEntraIdDeleteGroupTool,
  addGroupMemberTool as microsoftEntraIdAddGroupMemberTool,
  removeGroupMemberTool as microsoftEntraIdRemoveGroupMemberTool,
  listGroupMembersTool as microsoftEntraIdListGroupMembersTool,
  listRoleDefinitionsTool as microsoftEntraIdListRoleDefinitionsTool,
  listRoleAssignmentsTool as microsoftEntraIdListRoleAssignmentsTool,
  createRoleAssignmentTool as microsoftEntraIdCreateRoleAssignmentTool,
  removeRoleAssignmentTool as microsoftEntraIdRemoveRoleAssignmentTool,
  listDevicesTool as microsoftEntraIdListDevicesTool,
  getDeviceTool as microsoftEntraIdGetDeviceTool,
  enableDisableDeviceTool as microsoftEntraIdEnableDisableDeviceTool,
}
```

**Step 2: Add import to `tools/registry.ts`**

Add the import block alongside the other imports (alphabetically near the `microsoft_teams` import):

```typescript
import {
  microsoftEntraIdListUsersTool,
  microsoftEntraIdGetUserTool,
  microsoftEntraIdCreateUserTool,
  microsoftEntraIdUpdateUserTool,
  microsoftEntraIdDeleteUserTool,
  microsoftEntraIdEnableDisableUserTool,
  microsoftEntraIdResetPasswordTool,
  microsoftEntraIdListUserGroupsTool,
  microsoftEntraIdListGroupsTool,
  microsoftEntraIdGetGroupTool,
  microsoftEntraIdCreateGroupTool,
  microsoftEntraIdDeleteGroupTool,
  microsoftEntraIdAddGroupMemberTool,
  microsoftEntraIdRemoveGroupMemberTool,
  microsoftEntraIdListGroupMembersTool,
  microsoftEntraIdListRoleDefinitionsTool,
  microsoftEntraIdListRoleAssignmentsTool,
  microsoftEntraIdCreateRoleAssignmentTool,
  microsoftEntraIdRemoveRoleAssignmentTool,
  microsoftEntraIdListDevicesTool,
  microsoftEntraIdGetDeviceTool,
  microsoftEntraIdEnableDisableDeviceTool,
} from '@/tools/microsoft_entra_id'
```

**Step 3: Add tool registrations to the `tools` object**

Add these entries alphabetically near the other `microsoft_` entries in the registry object:

```typescript
  microsoft_entra_id_list_users: microsoftEntraIdListUsersTool,
  microsoft_entra_id_get_user: microsoftEntraIdGetUserTool,
  microsoft_entra_id_create_user: microsoftEntraIdCreateUserTool,
  microsoft_entra_id_update_user: microsoftEntraIdUpdateUserTool,
  microsoft_entra_id_delete_user: microsoftEntraIdDeleteUserTool,
  microsoft_entra_id_enable_disable_user: microsoftEntraIdEnableDisableUserTool,
  microsoft_entra_id_reset_password: microsoftEntraIdResetPasswordTool,
  microsoft_entra_id_list_user_groups: microsoftEntraIdListUserGroupsTool,
  microsoft_entra_id_list_groups: microsoftEntraIdListGroupsTool,
  microsoft_entra_id_get_group: microsoftEntraIdGetGroupTool,
  microsoft_entra_id_create_group: microsoftEntraIdCreateGroupTool,
  microsoft_entra_id_delete_group: microsoftEntraIdDeleteGroupTool,
  microsoft_entra_id_add_group_member: microsoftEntraIdAddGroupMemberTool,
  microsoft_entra_id_remove_group_member: microsoftEntraIdRemoveGroupMemberTool,
  microsoft_entra_id_list_group_members: microsoftEntraIdListGroupMembersTool,
  microsoft_entra_id_list_role_definitions: microsoftEntraIdListRoleDefinitionsTool,
  microsoft_entra_id_list_role_assignments: microsoftEntraIdListRoleAssignmentsTool,
  microsoft_entra_id_create_role_assignment: microsoftEntraIdCreateRoleAssignmentTool,
  microsoft_entra_id_remove_role_assignment: microsoftEntraIdRemoveRoleAssignmentTool,
  microsoft_entra_id_list_devices: microsoftEntraIdListDevicesTool,
  microsoft_entra_id_get_device: microsoftEntraIdGetDeviceTool,
  microsoft_entra_id_enable_disable_device: microsoftEntraIdEnableDisableDeviceTool,
```

**Step 4: Commit**

```bash
git add tools/microsoft_entra_id/index.ts tools/registry.ts
git commit -m "feat(entra-id): add barrel exports and register tools"
```

---

### Task 7: Create Block Config

**Files:**
- Create: `blocks/blocks/microsoft_entra_id.ts`

**Step 1: Create the block config file**

```typescript
import { MicrosoftIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'
import type { MicrosoftEntraIdResponse } from '@/tools/microsoft_entra_id/types'

export const MicrosoftEntraIdBlock: BlockConfig<MicrosoftEntraIdResponse> = {
  type: 'microsoft_entra_id',
  name: 'Microsoft Entra ID',
  description: 'Manage users, groups, roles, and devices in Microsoft Entra ID',
  authMode: AuthMode.OAuth,
  longDescription:
    'Automate identity management with Microsoft Entra ID (formerly Azure AD). Create and manage users, groups, directory role assignments, and devices via Microsoft Graph API. Requires admin consent for directory-level permissions.',
  category: 'tools',
  bgColor: '#0078D4',
  icon: MicrosoftIcon,
  subBlocks: [
    // Operation selector
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        // User Management
        { label: 'List Users', id: 'microsoft_entra_id_list_users' },
        { label: 'Get User', id: 'microsoft_entra_id_get_user' },
        { label: 'Create User', id: 'microsoft_entra_id_create_user' },
        { label: 'Update User', id: 'microsoft_entra_id_update_user' },
        { label: 'Delete User', id: 'microsoft_entra_id_delete_user' },
        { label: 'Enable/Disable User', id: 'microsoft_entra_id_enable_disable_user' },
        { label: 'Reset Password', id: 'microsoft_entra_id_reset_password' },
        { label: 'List User Groups', id: 'microsoft_entra_id_list_user_groups' },
        // Group Management
        { label: 'List Groups', id: 'microsoft_entra_id_list_groups' },
        { label: 'Get Group', id: 'microsoft_entra_id_get_group' },
        { label: 'Create Group', id: 'microsoft_entra_id_create_group' },
        { label: 'Delete Group', id: 'microsoft_entra_id_delete_group' },
        { label: 'Add Group Member', id: 'microsoft_entra_id_add_group_member' },
        { label: 'Remove Group Member', id: 'microsoft_entra_id_remove_group_member' },
        { label: 'List Group Members', id: 'microsoft_entra_id_list_group_members' },
        // Directory Roles
        { label: 'List Role Definitions', id: 'microsoft_entra_id_list_role_definitions' },
        { label: 'List Role Assignments', id: 'microsoft_entra_id_list_role_assignments' },
        { label: 'Create Role Assignment', id: 'microsoft_entra_id_create_role_assignment' },
        { label: 'Remove Role Assignment', id: 'microsoft_entra_id_remove_role_assignment' },
        // Device Management
        { label: 'List Devices', id: 'microsoft_entra_id_list_devices' },
        { label: 'Get Device', id: 'microsoft_entra_id_get_device' },
        { label: 'Enable/Disable Device', id: 'microsoft_entra_id_enable_disable_device' },
      ],
      value: () => 'microsoft_entra_id_list_users',
    },

    // OAuth credential
    {
      id: 'credential',
      title: 'Microsoft Account',
      type: 'oauth-input',
      serviceId: 'microsoft-entra-id',
      requiredScopes: [
        'openid', 'profile', 'email', 'offline_access',
        'User.ReadWrite.All', 'Group.ReadWrite.All', 'GroupMember.ReadWrite.All',
        'RoleManagement.ReadWrite.Directory', 'Directory.Read.All', 'Device.ReadWrite.All',
      ],
      placeholder: 'Select Microsoft account',
      required: true,
    },

    // --- User ID field (shared across many operations) ---
    {
      id: 'userId',
      title: 'User ID or UPN',
      type: 'short-input',
      placeholder: 'User ID or user@domain.com',
      condition: {
        field: 'operation',
        value: [
          'microsoft_entra_id_get_user',
          'microsoft_entra_id_update_user',
          'microsoft_entra_id_delete_user',
          'microsoft_entra_id_enable_disable_user',
          'microsoft_entra_id_reset_password',
          'microsoft_entra_id_list_user_groups',
        ],
      },
      required: true,
    },

    // --- Create User fields ---
    {
      id: 'displayName',
      title: 'Display Name',
      type: 'short-input',
      placeholder: 'John Doe',
      condition: { field: 'operation', value: 'microsoft_entra_id_create_user' },
      required: true,
    },
    {
      id: 'mailNickname',
      title: 'Mail Nickname',
      type: 'short-input',
      placeholder: 'johndoe',
      condition: { field: 'operation', value: ['microsoft_entra_id_create_user', 'microsoft_entra_id_create_group'] },
      required: true,
    },
    {
      id: 'userPrincipalName',
      title: 'User Principal Name',
      type: 'short-input',
      placeholder: 'johndoe@contoso.com',
      condition: { field: 'operation', value: 'microsoft_entra_id_create_user' },
      required: true,
    },
    {
      id: 'password',
      title: 'Password',
      type: 'short-input',
      placeholder: 'Initial password',
      condition: { field: 'operation', value: 'microsoft_entra_id_create_user' },
      required: true,
    },
    {
      id: 'accountEnabled',
      title: 'Account Enabled',
      type: 'dropdown',
      options: [
        { label: 'Yes', id: 'true' },
        { label: 'No', id: 'false' },
      ],
      condition: {
        field: 'operation',
        value: [
          'microsoft_entra_id_create_user',
          'microsoft_entra_id_enable_disable_user',
          'microsoft_entra_id_enable_disable_device',
        ],
      },
    },
    {
      id: 'forceChangePassword',
      title: 'Force Password Change',
      type: 'dropdown',
      options: [
        { label: 'Yes', id: 'true' },
        { label: 'No', id: 'false' },
      ],
      condition: {
        field: 'operation',
        value: ['microsoft_entra_id_create_user', 'microsoft_entra_id_reset_password'],
      },
    },

    // --- Update User fields ---
    {
      id: 'properties',
      title: 'Properties to Update (JSON)',
      type: 'code',
      language: 'json',
      placeholder: '{\n  "displayName": "Jane Doe",\n  "jobTitle": "Engineer",\n  "department": "IT"\n}',
      condition: { field: 'operation', value: 'microsoft_entra_id_update_user' },
      required: true,
    },

    // --- Reset Password fields ---
    {
      id: 'newPassword',
      title: 'New Password',
      type: 'short-input',
      placeholder: 'New password',
      condition: { field: 'operation', value: 'microsoft_entra_id_reset_password' },
      required: true,
    },

    // --- Group ID field (shared across group operations) ---
    {
      id: 'groupId',
      title: 'Group ID',
      type: 'short-input',
      placeholder: 'Group ID',
      condition: {
        field: 'operation',
        value: [
          'microsoft_entra_id_get_group',
          'microsoft_entra_id_delete_group',
          'microsoft_entra_id_add_group_member',
          'microsoft_entra_id_remove_group_member',
          'microsoft_entra_id_list_group_members',
        ],
      },
      required: true,
    },

    // --- Create Group fields ---
    {
      id: 'displayName',
      title: 'Display Name',
      type: 'short-input',
      placeholder: 'Group name',
      condition: { field: 'operation', value: 'microsoft_entra_id_create_group' },
      required: true,
    },
    {
      id: 'description',
      title: 'Description',
      type: 'long-input',
      placeholder: 'Group description',
      condition: { field: 'operation', value: 'microsoft_entra_id_create_group' },
    },
    {
      id: 'groupType',
      title: 'Group Type',
      type: 'dropdown',
      options: [
        { label: 'Security', id: 'security' },
        { label: 'Microsoft 365', id: 'microsoft365' },
      ],
      condition: { field: 'operation', value: 'microsoft_entra_id_create_group' },
      required: true,
    },

    // --- Add/Remove Group Member fields ---
    {
      id: 'memberId',
      title: 'Member ID',
      type: 'short-input',
      placeholder: 'User or service principal ID',
      condition: {
        field: 'operation',
        value: ['microsoft_entra_id_add_group_member', 'microsoft_entra_id_remove_group_member'],
      },
      required: true,
    },

    // --- Role Assignment fields ---
    {
      id: 'roleDefinitionId',
      title: 'Role Definition ID',
      type: 'short-input',
      placeholder: 'Role definition ID',
      condition: { field: 'operation', value: 'microsoft_entra_id_create_role_assignment' },
      required: true,
    },
    {
      id: 'principalId',
      title: 'Principal ID',
      type: 'short-input',
      placeholder: 'User or service principal ID',
      condition: { field: 'operation', value: 'microsoft_entra_id_create_role_assignment' },
      required: true,
    },
    {
      id: 'directoryScopeId',
      title: 'Directory Scope',
      type: 'short-input',
      placeholder: '/ (tenant-wide)',
      condition: { field: 'operation', value: 'microsoft_entra_id_create_role_assignment' },
    },
    {
      id: 'assignmentId',
      title: 'Assignment ID',
      type: 'short-input',
      placeholder: 'Role assignment ID',
      condition: { field: 'operation', value: 'microsoft_entra_id_remove_role_assignment' },
      required: true,
    },

    // --- Device ID field ---
    {
      id: 'deviceId',
      title: 'Device ID',
      type: 'short-input',
      placeholder: 'Device ID',
      condition: {
        field: 'operation',
        value: ['microsoft_entra_id_get_device', 'microsoft_entra_id_enable_disable_device'],
      },
      required: true,
    },

    // --- Filter/Select/Top for list operations (advanced mode) ---
    {
      id: 'filter',
      title: 'Filter (OData)',
      type: 'short-input',
      placeholder: "startsWith(displayName,'John')",
      condition: {
        field: 'operation',
        value: [
          'microsoft_entra_id_list_users',
          'microsoft_entra_id_list_groups',
          'microsoft_entra_id_list_devices',
          'microsoft_entra_id_list_role_definitions',
          'microsoft_entra_id_list_role_assignments',
        ],
      },
      mode: 'advanced',
    },
    {
      id: 'select',
      title: 'Select Properties',
      type: 'short-input',
      placeholder: 'id,displayName,mail',
      condition: {
        field: 'operation',
        value: [
          'microsoft_entra_id_list_users',
          'microsoft_entra_id_get_user',
          'microsoft_entra_id_list_groups',
          'microsoft_entra_id_get_group',
          'microsoft_entra_id_list_devices',
          'microsoft_entra_id_get_device',
        ],
      },
      mode: 'advanced',
    },
    {
      id: 'top',
      title: 'Max Results',
      type: 'short-input',
      placeholder: '100',
      condition: {
        field: 'operation',
        value: [
          'microsoft_entra_id_list_users',
          'microsoft_entra_id_list_groups',
          'microsoft_entra_id_list_devices',
        ],
      },
      mode: 'advanced',
    },
  ],
  tools: {
    access: [
      'microsoft_entra_id_list_users',
      'microsoft_entra_id_get_user',
      'microsoft_entra_id_create_user',
      'microsoft_entra_id_update_user',
      'microsoft_entra_id_delete_user',
      'microsoft_entra_id_enable_disable_user',
      'microsoft_entra_id_reset_password',
      'microsoft_entra_id_list_user_groups',
      'microsoft_entra_id_list_groups',
      'microsoft_entra_id_get_group',
      'microsoft_entra_id_create_group',
      'microsoft_entra_id_delete_group',
      'microsoft_entra_id_add_group_member',
      'microsoft_entra_id_remove_group_member',
      'microsoft_entra_id_list_group_members',
      'microsoft_entra_id_list_role_definitions',
      'microsoft_entra_id_list_role_assignments',
      'microsoft_entra_id_create_role_assignment',
      'microsoft_entra_id_remove_role_assignment',
      'microsoft_entra_id_list_devices',
      'microsoft_entra_id_get_device',
      'microsoft_entra_id_enable_disable_device',
    ],
    config: {
      tool: (params) => params.operation,
      params: (params) => {
        const { operation, credential, properties, ...rest } = params

        // Parse JSON properties for update user
        if (operation === 'microsoft_entra_id_update_user' && properties) {
          const parsedProperties = typeof properties === 'string' ? JSON.parse(properties) : properties
          return { ...rest, properties: parsedProperties, oauthCredential: credential }
        }

        return { ...rest, oauthCredential: credential }
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    credential: { type: 'string', description: 'Microsoft Entra ID OAuth credential' },
    userId: { type: 'string', description: 'User ID or userPrincipalName' },
    displayName: { type: 'string', description: 'Display name' },
    mailNickname: { type: 'string', description: 'Mail nickname/alias' },
    userPrincipalName: { type: 'string', description: 'User principal name (email)' },
    password: { type: 'string', description: 'Password' },
    newPassword: { type: 'string', description: 'New password for reset' },
    accountEnabled: { type: 'string', description: 'Account enabled status' },
    forceChangePassword: { type: 'string', description: 'Force password change on next sign-in' },
    properties: { type: 'json', description: 'JSON object of properties to update' },
    groupId: { type: 'string', description: 'Group ID' },
    description: { type: 'string', description: 'Description' },
    groupType: { type: 'string', description: 'Group type (security or microsoft365)' },
    memberId: { type: 'string', description: 'Member ID to add/remove' },
    roleDefinitionId: { type: 'string', description: 'Role definition ID' },
    principalId: { type: 'string', description: 'Principal ID for role assignment' },
    directoryScopeId: { type: 'string', description: 'Directory scope for role assignment' },
    assignmentId: { type: 'string', description: 'Role assignment ID' },
    deviceId: { type: 'string', description: 'Device ID' },
    filter: { type: 'string', description: 'OData filter expression' },
    select: { type: 'string', description: 'Properties to select' },
    top: { type: 'string', description: 'Max results to return' },
  },
  outputs: {
    users: { type: 'json', description: 'Array of Entra ID users' },
    user: { type: 'json', description: 'Entra ID user object' },
    groups: { type: 'json', description: 'Array of Entra ID groups' },
    group: { type: 'json', description: 'Entra ID group object' },
    members: { type: 'json', description: 'Array of group members' },
    roles: { type: 'json', description: 'Array of role definitions' },
    assignments: { type: 'json', description: 'Array of role assignments' },
    assignment: { type: 'json', description: 'Role assignment object' },
    devices: { type: 'json', description: 'Array of Entra ID devices' },
    device: { type: 'json', description: 'Entra ID device object' },
    success: { type: 'boolean', description: 'Whether the operation was successful' },
    metadata: { type: 'json', description: 'Operation metadata' },
  },
}
```

**Step 2: Commit**

```bash
git add blocks/blocks/microsoft_entra_id.ts
git commit -m "feat(entra-id): add Microsoft Entra ID block config"
```

---

### Task 8: Register Block in Block Registry

**Files:**
- Modify: `blocks/registry.ts`

**Step 1: Add import**

Add this import alphabetically near the other Microsoft imports (around line 99):

```typescript
import { MicrosoftEntraIdBlock } from '@/blocks/blocks/microsoft_entra_id'
```

**Step 2: Add registry entry**

Add this entry in the registry object alphabetically near other `microsoft_` entries (around line 300):

```typescript
  microsoft_entra_id: MicrosoftEntraIdBlock,
```

**Step 3: Commit**

```bash
git add blocks/registry.ts
git commit -m "feat(entra-id): register Microsoft Entra ID block"
```

---

### Task 9: Register OAuth Provider Service

**Files:**
- Modify: `lib/oauth/oauth.ts` — add `microsoft-entra-id` service to `OAUTH_PROVIDERS.microsoft.services`
- Modify: `lib/oauth/microsoft.ts` — add `microsoft-entra-id` to `MICROSOFT_PROVIDERS` set
- Modify: `app/api/auth/oauth/authorize/route.ts` — add scopes for `microsoft-entra-id` in `getScopesForProvider`

**Step 1: Add service to OAUTH_PROVIDERS**

In `lib/oauth/oauth.ts`, add a new service entry inside `microsoft.services` (between `microsoft-dataverse` and `microsoft-excel`):

```typescript
      'microsoft-entra-id': {
        name: 'Microsoft Entra ID',
        description: 'Manage users, groups, roles, and devices in Microsoft Entra ID.',
        providerId: 'microsoft-entra-id',
        icon: MicrosoftIcon,
        baseProviderIcon: MicrosoftIcon,
        scopes: [
          'openid', 'profile', 'email', 'offline_access',
          'User.ReadWrite.All', 'Group.ReadWrite.All', 'GroupMember.ReadWrite.All',
          'RoleManagement.ReadWrite.Directory', 'Directory.Read.All', 'Device.ReadWrite.All',
        ],
      },
```

**Step 2: Add to MICROSOFT_PROVIDERS set**

In `lib/oauth/microsoft.ts`, add `'microsoft-entra-id'` to the `MICROSOFT_PROVIDERS` set:

```typescript
export const MICROSOFT_PROVIDERS = new Set([
  'microsoft-dataverse',
  'microsoft-entra-id',
  'microsoft-excel',
  'microsoft-planner',
  'microsoft-teams',
  'outlook',
  'onedrive',
  'sharepoint',
])
```

**Step 3: Add scopes to authorize route**

In `app/api/auth/oauth/authorize/route.ts`, add `microsoft-entra-id` to the `scopeMap` in `getScopesForProvider`:

```typescript
    'microsoft-entra-id': [
      'openid', 'profile', 'email', 'offline_access',
      'User.ReadWrite.All', 'Group.ReadWrite.All', 'GroupMember.ReadWrite.All',
      'RoleManagement.ReadWrite.Directory', 'Directory.Read.All', 'Device.ReadWrite.All',
    ],
```

Note: The `getBaseProvider` function already handles `microsoft-entra-id` correctly because it starts with `microsoft` and maps to the `microsoft` base provider. No changes needed there.

**Step 4: Commit**

```bash
git add lib/oauth/oauth.ts lib/oauth/microsoft.ts app/api/auth/oauth/authorize/route.ts
git commit -m "feat(entra-id): register Microsoft Entra ID OAuth service"
```

---

### Task 10: Type-Check and Verify

**Step 1: Run type check**

Run: `cd /home/dean/sim && bun run type-check`
Expected: No type errors related to microsoft_entra_id files

**Step 2: Fix any type errors**

If there are type errors, fix them based on the error messages.

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix(entra-id): resolve type errors"
```
