import { createLogger } from '@sim/logger'
import type {
  ListRoleDefinitionsParams,
  ListRoleDefinitionsResponse,
} from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EntraIdListRoleDefinitions')

export const listRoleDefinitionsTool: ToolConfig<
  ListRoleDefinitionsParams,
  ListRoleDefinitionsResponse
> = {
  id: 'microsoft_entra_id_list_role_definitions',
  name: 'List Entra ID Role Definitions',
  description:
    'List directory role definitions in Microsoft Entra ID. Optionally filter by display name or other properties.',
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
        "OData filter expression (e.g., \"displayName eq 'Global Administrator'\")",
    },
  },

  request: {
    url: (params) => {
      const url = new URL(
        'https://graph.microsoft.com/v1.0/roleManagement/directory/roleDefinitions'
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
      logger.error('List role definitions failed', { status: response.status, error: data.error })
      throw new Error(data.error?.message || JSON.stringify(data))
    }

    const roles = data.value || []

    return {
      success: true,
      output: {
        roles,
        metadata: {
          count: roles.length,
        },
      },
    }
  },

  outputs: {
    roles: {
      type: 'json',
      description: 'Array of directory role definitions',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including count',
    },
  },
}
