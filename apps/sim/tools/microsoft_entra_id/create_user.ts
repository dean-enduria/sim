import { createLogger } from '@sim/logger'
import type { CreateUserParams, CreateUserResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdCreateUserTool')

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

export const microsoftEntraIdCreateUserTool: ToolConfig<CreateUserParams, CreateUserResponse> = {
  id: 'microsoft_entra_id_create_user',
  name: 'Microsoft Entra ID Create User',
  description: 'Create a new user in Microsoft Entra ID',
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
    displayName: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Display name of the user (e.g., "John Doe")',
    },
    mailNickname: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Mail alias for the user (e.g., "johnd")',
    },
    userPrincipalName: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'User principal name (e.g., "johnd@contoso.com")',
    },
    password: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Initial password for the user',
    },
    accountEnabled: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Whether the account is enabled (default: "true")',
    },
    forceChangePassword: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Force password change on next sign-in (default: "true")',
    },
  },

  request: {
    url: () => `${GRAPH_API_BASE}/users`,
    method: 'POST',
    headers: (params: CreateUserParams) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params: CreateUserParams) => ({
      accountEnabled: params.accountEnabled !== 'false',
      displayName: params.displayName,
      mailNickname: params.mailNickname,
      userPrincipalName: params.userPrincipalName,
      passwordProfile: {
        password: params.password,
        forceChangePasswordNextSignIn: params.forceChangePassword !== 'false',
      },
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
        metadata: {
          userId: user.id,
        },
      },
    }
  },

  outputs: {
    user: {
      type: 'object',
      description: 'Created user object from Microsoft Entra ID',
    },
    metadata: {
      type: 'object',
      description: 'Metadata including the new user ID',
    },
  },
}
