import { createLogger } from '@sim/logger'
import type { DeleteGroupParams, DeleteGroupResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdGroups')

export const microsoftEntraIdDeleteGroupTool: ToolConfig<DeleteGroupParams, DeleteGroupResponse> = {
  id: 'microsoft_entra_id_delete_group',
  name: 'Delete Group from Microsoft Entra ID',
  description: 'Delete a group from Microsoft Entra ID by its ID',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden' },
    groupId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The unique identifier of the group to delete',
    },
  },

  request: {
    url: (params) =>
      `https://graph.microsoft.com/v1.0/groups/${encodeURIComponent(params.groupId)}`,
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
        },
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Operation success status' },
    output: {
      type: 'object',
      description: 'Deletion result',
      properties: {
        success: { type: 'boolean', description: 'Whether the group was successfully deleted' },
        metadata: {
          type: 'object',
          description: 'Response metadata',
          properties: {
            groupId: { type: 'string', description: 'ID of the deleted group' },
          },
        },
      },
    },
  },
}
