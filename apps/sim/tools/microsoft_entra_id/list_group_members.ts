import { createLogger } from '@sim/logger'
import type {
  ListGroupMembersParams,
  ListGroupMembersResponse,
} from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdGroups')

export const microsoftEntraIdListGroupMembersTool: ToolConfig<
  ListGroupMembersParams,
  ListGroupMembersResponse
> = {
  id: 'microsoft_entra_id_list_group_members',
  name: 'List Group Members in Microsoft Entra ID',
  description: 'List all members of a group in Microsoft Entra ID',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden' },
    groupId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The unique identifier of the group',
    },
  },

  request: {
    url: (params) =>
      `https://graph.microsoft.com/v1.0/groups/${encodeURIComponent(params.groupId)}/members`,
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      logger.error('Microsoft Entra ID API request failed', { data, status: response.status })
      throw new Error(data.error?.message || JSON.stringify(data))
    }

    const members = data.value || []

    return {
      success: true,
      output: {
        members,
        metadata: {
          count: members.length,
        },
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Operation success status' },
    output: {
      type: 'object',
      description: 'List of group members',
      properties: {
        members: {
          type: 'array',
          description: 'Array of member objects',
          items: { type: 'json', description: 'Member object' },
        },
        metadata: {
          type: 'object',
          description: 'Response metadata',
          properties: {
            count: { type: 'number', description: 'Number of members returned' },
          },
        },
      },
    },
  },
}
