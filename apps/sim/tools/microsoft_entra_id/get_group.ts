import { createLogger } from '@sim/logger'
import type { GetGroupParams, GetGroupResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdGroups')

export const microsoftEntraIdGetGroupTool: ToolConfig<GetGroupParams, GetGroupResponse> = {
  id: 'microsoft_entra_id_get_group',
  name: 'Get Group from Microsoft Entra ID',
  description: 'Get details of a specific group in Microsoft Entra ID by its ID',
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
    select: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Comma-separated list of properties to return (e.g., "id,displayName,mail")',
    },
  },

  request: {
    url: (params) => {
      const query = params.select
        ? `?$select=${encodeURIComponent(params.select)}`
        : ''
      return `https://graph.microsoft.com/v1.0/groups/${encodeURIComponent(params.groupId)}${query}`
    },
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

    return {
      success: true,
      output: {
        group: data,
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Operation success status' },
    output: {
      type: 'object',
      description: 'Group details',
      properties: {
        group: { type: 'json', description: 'Group object' },
      },
    },
  },
}
