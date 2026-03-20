import { createLogger } from '@sim/logger'
import type {
  RemoveRoleAssignmentParams,
  RemoveRoleAssignmentResponse,
} from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EntraIdRemoveRoleAssignment')

export const removeRoleAssignmentTool: ToolConfig<
  RemoveRoleAssignmentParams,
  RemoveRoleAssignmentResponse
> = {
  id: 'microsoft_entra_id_remove_role_assignment',
  name: 'Remove Entra ID Role Assignment',
  description:
    'Remove a directory role assignment in Microsoft Entra ID.',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'OAuth access token for Microsoft Graph API',
    },
    assignmentId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the role assignment to remove',
    },
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

  transformResponse: async (response: Response, params?: RemoveRoleAssignmentParams) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      logger.error('Remove role assignment failed', { status: response.status, error: data.error })
      throw new Error(data.error?.message || JSON.stringify(data))
    }

    return {
      success: true,
      output: {
        success: true,
        metadata: {
          assignmentId: params?.assignmentId ?? '',
        },
      },
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the role assignment was removed successfully',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including assignment ID',
    },
  },
}
