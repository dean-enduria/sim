import { createLogger } from '@sim/logger'
import type { GetUserParams, GetUserResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdGetUserTool')

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

export const microsoftEntraIdGetUserTool: ToolConfig<GetUserParams, GetUserResponse> = {
  id: 'microsoft_entra_id_get_user',
  name: 'Microsoft Entra ID Get User',
  description: 'Get a specific user from Microsoft Entra ID by ID or userPrincipalName',
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
    userId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'User ID or userPrincipalName',
    },
    select: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Comma-separated list of properties to return (e.g., "displayName,mail,id")',
    },
  },

  request: {
    url: (params: GetUserParams) => {
      const url = new URL(`${GRAPH_API_BASE}/users/${encodeURIComponent(params.userId)}`)
      if (params.select) url.searchParams.append('$select', params.select)
      return url.toString()
    },
    method: 'GET',
    headers: (params: GetUserParams) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response: Response) => {
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || JSON.stringify(data))
    }

    const user = await response.json()

    return {
      success: true,
      output: {
        user,
      },
    }
  },

  outputs: {
    user: {
      type: 'object',
      description: 'User object from Microsoft Entra ID',
    },
  },
}
