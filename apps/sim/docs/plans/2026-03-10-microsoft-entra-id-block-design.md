# Microsoft Entra ID Block — Design

## Goal

Create a SIM block for automating Microsoft Entra ID (formerly Azure AD) identity operations via Microsoft Graph API v1.0. Covers user management, group management, directory roles, and basic device management.

## Architecture

Single `microsoft_entra_id` block with a dedicated `microsoft-entra-id` OAuth service. Operations dispatched via dropdown, conditional sub-blocks per operation. Server-side tool handlers make direct HTTP requests to `https://graph.microsoft.com/v1.0/`.

## Operations (22)

### User Management (8)

| Operation | Tool ID | Graph Endpoint | Method |
|-----------|---------|----------------|--------|
| List users | `microsoft_entra_id_list_users` | `/users` | GET |
| Get user | `microsoft_entra_id_get_user` | `/users/{id}` | GET |
| Create user | `microsoft_entra_id_create_user` | `/users` | POST |
| Update user | `microsoft_entra_id_update_user` | `/users/{id}` | PATCH |
| Delete user | `microsoft_entra_id_delete_user` | `/users/{id}` | DELETE |
| Enable/disable user | `microsoft_entra_id_enable_disable_user` | `/users/{id}` | PATCH |
| Reset password | `microsoft_entra_id_reset_password` | `/users/{id}` | PATCH |
| List user group memberships | `microsoft_entra_id_list_user_groups` | `/users/{id}/memberOf` | GET |

### Group Management (7)

| Operation | Tool ID | Graph Endpoint | Method |
|-----------|---------|----------------|--------|
| List groups | `microsoft_entra_id_list_groups` | `/groups` | GET |
| Get group | `microsoft_entra_id_get_group` | `/groups/{id}` | GET |
| Create group | `microsoft_entra_id_create_group` | `/groups` | POST |
| Delete group | `microsoft_entra_id_delete_group` | `/groups/{id}` | DELETE |
| Add member | `microsoft_entra_id_add_group_member` | `/groups/{id}/members/$ref` | POST |
| Remove member | `microsoft_entra_id_remove_group_member` | `/groups/{id}/members/{memberId}/$ref` | DELETE |
| List members | `microsoft_entra_id_list_group_members` | `/groups/{id}/members` | GET |

### Directory Roles (4)

| Operation | Tool ID | Graph Endpoint | Method |
|-----------|---------|----------------|--------|
| List role definitions | `microsoft_entra_id_list_role_definitions` | `/roleManagement/directory/roleDefinitions` | GET |
| List role assignments | `microsoft_entra_id_list_role_assignments` | `/roleManagement/directory/roleAssignments` | GET |
| Create role assignment | `microsoft_entra_id_create_role_assignment` | `/roleManagement/directory/roleAssignments` | POST |
| Remove role assignment | `microsoft_entra_id_remove_role_assignment` | `/roleManagement/directory/roleAssignments/{id}` | DELETE |

### Device Management (3)

| Operation | Tool ID | Graph Endpoint | Method |
|-----------|---------|----------------|--------|
| List devices | `microsoft_entra_id_list_devices` | `/devices` | GET |
| Get device | `microsoft_entra_id_get_device` | `/devices/{id}` | GET |
| Enable/disable device | `microsoft_entra_id_enable_disable_device` | `/devices/{id}` | PATCH |

## Authentication

New `microsoft-entra-id` OAuth service, separate from existing Microsoft integrations.

**Scopes:**
- `openid`, `profile`, `email`, `offline_access`
- `User.ReadWrite.All`
- `Group.ReadWrite.All`
- `GroupMember.ReadWrite.All`
- `RoleManagement.ReadWrite.Directory`
- `Directory.Read.All`
- `Device.ReadWrite.All`

All directory scopes require admin consent.

## Block UI

- **Operation dropdown** — 22 operations grouped by category
- **Credential** — `oauth-input` with `serviceId: 'microsoft-entra-id'`
- **Conditional fields** — each operation shows only relevant parameters
- **JSON code editor** — for update user (properties to patch)
- **OData filter/select** — for list operations (advanced mode)
- **User/Group ID** — short-input for operations targeting specific resources

## Tool Handler Pattern

Each tool is a `ToolConfig` in `tools/microsoft_entra_id/`. All tools:
- Require OAuth with `provider: 'microsoft-entra-id'`
- Use Bearer token auth: `Authorization: Bearer {accessToken}`
- Target `https://graph.microsoft.com/v1.0/` endpoints
- Return standardized `ToolResponse` with `success`, `output`, and metadata

## Outputs

- `result` — Primary response (user/group/device/role object or array)
- `metadata` — Operation metadata (id, count, nextLink for pagination)

## File Structure

```
blocks/blocks/microsoft_entra_id.ts
tools/microsoft_entra_id/
  list_users.ts
  get_user.ts
  create_user.ts
  update_user.ts
  delete_user.ts
  enable_disable_user.ts
  reset_password.ts
  list_user_groups.ts
  list_groups.ts
  get_group.ts
  create_group.ts
  delete_group.ts
  add_group_member.ts
  remove_group_member.ts
  list_group_members.ts
  list_role_definitions.ts
  list_role_assignments.ts
  create_role_assignment.ts
  remove_role_assignment.ts
  list_devices.ts
  get_device.ts
  enable_disable_device.ts
  index.ts
```

Registration updates: `blocks/registry.ts`, `tools/registry.ts`.
