import { createLogger } from '@sim/logger'
import type {
  AddGroupMemberParams,
  AddGroupMemberResponse,
} from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdGroups')

export const microsoftEntraIdAddGroupMemberTool: ToolConfig<
  AddGroupMemberParams,
  AddGroupMemberResponse
> = {
  id: 'microsoft_entra_id_add_group_member',
  name: 'Add Member to Group in Microsoft Entra ID',
  description: 'Add a user or directory object as a member of a group in Microsoft Entra ID',
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
      description: 'The unique identifier of the user or directory object to add as a member',
    },
  },

  request: {
    url: (params) =>
      `https://graph.microsoft.com/v1.0/groups/${encodeURIComponent(params.groupId)}/members/$ref`,
    method: 'POST',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      '@odata.id': `https://graph.microsoft.com/v1.0/directoryObjects/${encodeURIComponent(params.memberId)}`,
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
      description: 'Add member result',
      properties: {
        success: { type: 'boolean', description: 'Whether the member was successfully added' },
        metadata: {
          type: 'object',
          description: 'Response metadata',
          properties: {
            groupId: { type: 'string', description: 'ID of the group' },
            memberId: { type: 'string', description: 'ID of the added member' },
          },
        },
      },
    },
  },
}
