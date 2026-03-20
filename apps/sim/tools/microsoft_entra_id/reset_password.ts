import { createLogger } from '@sim/logger'
import type { ResetPasswordParams, ResetPasswordResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdResetPasswordTool')

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

export const microsoftEntraIdResetPasswordTool: ToolConfig<
  ResetPasswordParams,
  ResetPasswordResponse
> = {
  id: 'microsoft_entra_id_reset_password',
  name: 'Microsoft Entra ID Reset Password',
  description: 'Reset a user password in Microsoft Entra ID',
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
      description: 'User ID or userPrincipalName of the user',
    },
    newPassword: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The new password for the user',
    },
    forceChangePassword: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Force the user to change password on next sign-in (default: "true")',
    },
  },

  request: {
    url: (params: ResetPasswordParams) =>
      `${GRAPH_API_BASE}/users/${encodeURIComponent(params.userId)}`,
    method: 'PATCH',
    headers: (params: ResetPasswordParams) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params: ResetPasswordParams) => ({
      passwordProfile: {
        password: params.newPassword,
        forceChangePasswordNextSignIn: params.forceChangePassword !== 'false',
      },
    }),
  },

  transformResponse: async (response: Response, params?: ResetPasswordParams) => {
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
      description: 'Whether the password was successfully reset',
    },
    metadata: {
      type: 'object',
      description: 'Metadata including the user ID',
    },
  },
}
