import { createLogger } from '@sim/logger'
import type { DeleteUserParams, DeleteUserResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdDeleteUserTool')

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

export const microsoftEntraIdDeleteUserTool: ToolConfig<DeleteUserParams, DeleteUserResponse> = {
  id: 'microsoft_entra_id_delete_user',
  name: 'Microsoft Entra ID Delete User',
  description: 'Delete a user from Microsoft Entra ID',
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
      description: 'User ID or userPrincipalName of the user to delete',
    },
  },

  request: {
    url: (params: DeleteUserParams) =>
      `${GRAPH_API_BASE}/users/${encodeURIComponent(params.userId)}`,
    method: 'DELETE',
    headers: (params: DeleteUserParams) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response: Response, params?: DeleteUserParams) => {
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || JSON.stringify(data))
    }

    // DELETE returns 204 No Content on success
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
      description: 'Whether the user was successfully deleted',
    },
    metadata: {
      type: 'object',
      description: 'Metadata including the user ID',
    },
  },
}
