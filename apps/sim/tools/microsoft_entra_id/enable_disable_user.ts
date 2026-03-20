import { createLogger } from '@sim/logger'
import type {
  EnableDisableUserParams,
  EnableDisableUserResponse,
} from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdEnableDisableUserTool')

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

export const microsoftEntraIdEnableDisableUserTool: ToolConfig<
  EnableDisableUserParams,
  EnableDisableUserResponse
> = {
  id: 'microsoft_entra_id_enable_disable_user',
  name: 'Microsoft Entra ID Enable/Disable User',
  description: 'Enable or disable a user account in Microsoft Entra ID',
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
      description: 'User ID or userPrincipalName of the user to enable/disable',
    },
    accountEnabled: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Set to "true" to enable the account or "false" to disable it',
    },
  },

  request: {
    url: (params: EnableDisableUserParams) =>
      `${GRAPH_API_BASE}/users/${encodeURIComponent(params.userId)}`,
    method: 'PATCH',
    headers: (params: EnableDisableUserParams) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params: EnableDisableUserParams) => ({
      accountEnabled: params.accountEnabled === 'true',
    }),
  },

  transformResponse: async (response: Response, params?: EnableDisableUserParams) => {
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error?.message || JSON.stringify(data))
    }

    // PATCH returns 204 No Content on success
    const accountEnabled = params?.accountEnabled === 'true'

    return {
      success: true,
      output: {
        success: true,
        metadata: {
          userId: params?.userId || '',
          accountEnabled,
        },
      },
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the user account was successfully updated',
    },
    metadata: {
      type: 'object',
      description: 'Metadata including user ID and account status',
    },
  },
}
