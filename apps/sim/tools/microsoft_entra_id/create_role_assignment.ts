import { createLogger } from '@sim/logger'
import type {
  CreateRoleAssignmentParams,
  CreateRoleAssignmentResponse,
} from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EntraIdCreateRoleAssignment')

export const createRoleAssignmentTool: ToolConfig<
  CreateRoleAssignmentParams,
  CreateRoleAssignmentResponse
> = {
  id: 'microsoft_entra_id_create_role_assignment',
  name: 'Create Entra ID Role Assignment',
  description:
    'Assign a directory role to a principal (user, group, or service principal) in Microsoft Entra ID.',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'OAuth access token for Microsoft Graph API',
    },
    roleDefinitionId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the role definition to assign',
    },
    principalId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the principal (user, group, or service principal) to assign the role to',
    },
    directoryScopeId: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: "The scope of the role assignment (defaults to '/' for tenant-wide)",
    },
  },

  request: {
    url: () =>
      'https://graph.microsoft.com/v1.0/roleManagement/directory/roleAssignments',
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

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      logger.error('Create role assignment failed', { status: response.status, error: data.error })
      throw new Error(data.error?.message || JSON.stringify(data))
    }

    return {
      success: true,
      output: {
        assignment: data,
        metadata: {
          assignmentId: data.id,
        },
      },
    }
  },

  outputs: {
    assignment: {
      type: 'json',
      description: 'The created role assignment object',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including assignment ID',
    },
  },
}
