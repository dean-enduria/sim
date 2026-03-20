import { microsoftEntraIdListUsersTool } from '@/tools/microsoft_entra_id/list_users'
import { microsoftEntraIdGetUserTool } from '@/tools/microsoft_entra_id/get_user'
import { microsoftEntraIdCreateUserTool } from '@/tools/microsoft_entra_id/create_user'
import { microsoftEntraIdUpdateUserTool } from '@/tools/microsoft_entra_id/update_user'
import { microsoftEntraIdDeleteUserTool } from '@/tools/microsoft_entra_id/delete_user'
import { microsoftEntraIdEnableDisableUserTool } from '@/tools/microsoft_entra_id/enable_disable_user'
import { microsoftEntraIdResetPasswordTool } from '@/tools/microsoft_entra_id/reset_password'
import { microsoftEntraIdListUserGroupsTool } from '@/tools/microsoft_entra_id/list_user_groups'
import { microsoftEntraIdListGroupsTool } from '@/tools/microsoft_entra_id/list_groups'
import { microsoftEntraIdGetGroupTool } from '@/tools/microsoft_entra_id/get_group'
import { microsoftEntraIdCreateGroupTool } from '@/tools/microsoft_entra_id/create_group'
import { microsoftEntraIdDeleteGroupTool } from '@/tools/microsoft_entra_id/delete_group'
import { microsoftEntraIdAddGroupMemberTool } from '@/tools/microsoft_entra_id/add_group_member'
import { microsoftEntraIdRemoveGroupMemberTool } from '@/tools/microsoft_entra_id/remove_group_member'
import { microsoftEntraIdListGroupMembersTool } from '@/tools/microsoft_entra_id/list_group_members'
import { listRoleDefinitionsTool } from '@/tools/microsoft_entra_id/list_role_definitions'
import { listRoleAssignmentsTool } from '@/tools/microsoft_entra_id/list_role_assignments'
import { createRoleAssignmentTool } from '@/tools/microsoft_entra_id/create_role_assignment'
import { removeRoleAssignmentTool } from '@/tools/microsoft_entra_id/remove_role_assignment'
import { listDevicesTool } from '@/tools/microsoft_entra_id/list_devices'
import { getDeviceTool } from '@/tools/microsoft_entra_id/get_device'
import { enableDisableDeviceTool } from '@/tools/microsoft_entra_id/enable_disable_device'

export {
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
  listRoleDefinitionsTool as microsoftEntraIdListRoleDefinitionsTool,
  listRoleAssignmentsTool as microsoftEntraIdListRoleAssignmentsTool,
  createRoleAssignmentTool as microsoftEntraIdCreateRoleAssignmentTool,
  removeRoleAssignmentTool as microsoftEntraIdRemoveRoleAssignmentTool,
  listDevicesTool as microsoftEntraIdListDevicesTool,
  getDeviceTool as microsoftEntraIdGetDeviceTool,
  enableDisableDeviceTool as microsoftEntraIdEnableDisableDeviceTool,
}
