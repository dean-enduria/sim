import { createLogger } from '@sim/logger'
import type {
  RemoveGroupMemberParams,
  RemoveGroupMemberResponse,
} from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdGroups')

export const microsoftEntraIdRemoveGroupMemberTool: ToolConfig<
  RemoveGroupMemberParams,
  RemoveGroupMemberResponse
> = {
  id: 'microsoft_entra_id_remove_group_member',
  name: 'Remove Member from Group in Microsoft Entra ID',
  description: 'Remove a member from a group in Microsoft Entra ID',
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
    memberId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The unique identifier of the member to remove',
    },
  },

  request: {
    url: (params) =>
      `https://graph.microsoft.com/v1.0/groups/${encodeURIComponent(params.groupId)}/members/${encodeURIComponent(params.memberId)}/$ref`,
    method: 'DELETE',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
    }),
  },

  transformResponse: async (response: Response, params?) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      logger.error('Microsoft Entra ID API request failed', { data, status: response.status })
      throw new Error(data.error?.message || JSON.stringify(data))
    }

    return {
      success: true,
      output: {
        success: true,
        metadata: {
          groupId: params?.groupId || '',
          memberId: params?.memberId || '',
        },
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Operation success status' },
    output: {
      type: 'object',
      description: 'Remove member result',
      properties: {
        success: { type: 'boolean', description: 'Whether the member was successfully removed' },
        metadata: {
          type: 'object',
          description: 'Response metadata',
          properties: {
            groupId: { type: 'string', description: 'ID of the group' },
            memberId: { type: 'string', description: 'ID of the removed member' },
          },
        },
      },
    },
  },
}
