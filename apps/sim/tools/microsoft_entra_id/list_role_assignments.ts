import { createLogger } from '@sim/logger'
import type {
  ListRoleAssignmentsParams,
  ListRoleAssignmentsResponse,
} from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EntraIdListRoleAssignments')

export const listRoleAssignmentsTool: ToolConfig<
  ListRoleAssignmentsParams,
  ListRoleAssignmentsResponse
> = {
  id: 'microsoft_entra_id_list_role_assignments',
  name: 'List Entra ID Role Assignments',
  description:
    'List directory role assignments in Microsoft Entra ID. Optionally filter by principal or role definition.',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'OAuth access token for Microsoft Graph API',
    },
    filter: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description:
        "OData filter expression (e.g., \"principalId eq '{userId}'\")",
    },
  },

  request: {
    url: (params) => {
      const url = new URL(
        'https://graph.microsoft.com/v1.0/roleManagement/directory/roleAssignments'
      )
      if (params.filter) url.searchParams.set('$filter', params.filter)
      return url.toString()
    },
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      logger.error('List role assignments failed', { status: response.status, error: data.error })
      throw new Error(data.error?.message || JSON.stringify(data))
    }

    const assignments = data.value || []

    return {
      success: true,
      output: {
        assignments,
        metadata: {
          count: assignments.length,
        },
      },
    }
  },

  outputs: {
    assignments: {
      type: 'json',
      description: 'Array of directory role assignments',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including count',
    },
  },
}
