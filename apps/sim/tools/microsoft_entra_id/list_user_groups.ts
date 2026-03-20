import { createLogger } from '@sim/logger'
import type {
  ListUserGroupsParams,
  ListUserGroupsResponse,
} from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdListUserGroupsTool')

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'

export const microsoftEntraIdListUserGroupsTool: ToolConfig<
  ListUserGroupsParams,
  ListUserGroupsResponse
> = {
  id: 'microsoft_entra_id_list_user_groups',
  name: 'Microsoft Entra ID List User Groups',
  description: 'List all groups a user is a member of in Microsoft Entra ID',
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
  },

  request: {
    url: (params: ListUserGroupsParams) =>
      `${GRAPH_API_BASE}/users/${encodeURIComponent(params.userId)}/memberOf`,
    method: 'GET',
    headers: (params: ListUserGroupsParams) => ({
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
    const allMembers = data.value || []

    // Filter to only include group types
    const groups = allMembers.filter(
      (member: any) => member['@odata.type'] === '#microsoft.graph.group'
    )

    return {
      success: true,
      output: {
        groups,
        metadata: {
          count: groups.length,
        },
      },
    }
  },

  outputs: {
    groups: {
      type: 'array',
      description: 'Array of group objects the user is a member of',
      items: { type: 'object' },
    },
    metadata: {
      type: 'object',
      description: 'Response metadata including count',
    },
  },
}
