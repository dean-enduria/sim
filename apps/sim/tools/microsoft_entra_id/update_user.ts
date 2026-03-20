import { createLogger } from '@sim/logger'
import type { UpdateUserParams, UpdateUserResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdUpdateUserTool')

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

export const microsoftEntraIdUpdateUserTool: ToolConfig<UpdateUserParams, UpdateUserResponse> = {
  id: 'microsoft_entra_id_update_user',
  name: 'Microsoft Entra ID Update User',
  description: 'Update properties of an existing user in Microsoft Entra ID',
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
      description: 'User ID or userPrincipalName of the user to update',
    },
    properties: {
      type: 'json',
      required: true,
      visibility: 'user-or-llm',
      description: 'JSON object of properties to update (e.g., {"displayName": "New Name", "jobTitle": "Manager"})',
    },
  },

  request: {
    url: (params: UpdateUserParams) =>
      `${GRAPH_API_BASE}/users/${encodeURIComponent(params.userId)}`,
    method: 'PATCH',
    headers: (params: UpdateUserParams) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params: UpdateUserParams) => params.properties,
  },

  transformResponse: async (response: Response, params?: UpdateUserParams) => {
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || JSON.stringify(data))
    }

    // PATCH returns 204 No Content on success
    return {
      success: true,
      output: {
        success: true,
        metadata: {
          userId: params?.userId || '',
        },
      },
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the user was successfully updated',
    },
    metadata: {
      type: 'object',
      description: 'Metadata including the user ID',
    },
  },
}
