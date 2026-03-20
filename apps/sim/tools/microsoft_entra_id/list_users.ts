import { createLogger } from '@sim/logger'
import type { ListUsersParams, ListUsersResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdListUsersTool')

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

export const microsoftEntraIdListUsersTool: ToolConfig<ListUsersParams, ListUsersResponse> = {
  id: 'microsoft_entra_id_list_users',
  name: 'Microsoft Entra ID List Users',
  description: 'List users in Microsoft Entra ID (Azure AD) with optional filtering',
  version: '1.0.0',

  oauth: {
    required: true,
    provider: 'microsoft-entra-id',
  },

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
      description: 'OData filter expression (e.g., "startsWith(displayName, \'John\')")',
    },
    select: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Comma-separated list of properties to return (e.g., "displayName,mail,id")',
    },
    top: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of results to return (default: 100)',
    },
  },

  request: {
    url: (params: ListUsersParams) => {
      const url = new URL(`${GRAPH_API_BASE}/users`)
      if (params.filter) url.searchParams.append('$filter', params.filter)
      if (params.select) url.searchParams.append('$select', params.select)
      if (params.top) url.searchParams.append('$top', params.top)
      return url.toString()
    },
    method: 'GET',
    headers: (params: ListUsersParams) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || JSON.stringify(data))
    }

    const data = await response.json()
    const users = data.value || []

    return {
      success: true,
      output: {
        users,
        metadata: {
          count: users.length,
          nextLink: data['@odata.nextLink'],
        },
      },
    }
  },

  outputs: {
    users: {
      type: 'array',
      description: 'Array of user objects from Microsoft Entra ID',
      items: { type: 'object' },
    },
    metadata: {
      type: 'object',
      description: 'Response metadata including count and pagination',
    },
  },
}
