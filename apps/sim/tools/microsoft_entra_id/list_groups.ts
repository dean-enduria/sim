import { createLogger } from '@sim/logger'
import type { ListGroupsParams, ListGroupsResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdGroups')

export const microsoftEntraIdListGroupsTool: ToolConfig<ListGroupsParams, ListGroupsResponse> = {
  id: 'microsoft_entra_id_list_groups',
  name: 'List Groups in Microsoft Entra ID',
  description: 'List groups in Microsoft Entra ID with optional filtering and field selection',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden' },
    filter: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'OData filter expression (e.g., "displayName eq \'Engineering\'")',
    },
    select: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Comma-separated list of properties to return (e.g., "id,displayName,mail")',
    },
    top: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of groups to return',
    },
  },

  request: {
    url: (params) => {
      const queryParts: string[] = []
      if (params.filter) queryParts.push(`$filter=${encodeURIComponent(params.filter)}`)
      if (params.select) queryParts.push(`$select=${encodeURIComponent(params.select)}`)
      if (params.top) queryParts.push(`$top=${encodeURIComponent(params.top)}`)
      const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''
      return `https://graph.microsoft.com/v1.0/groups${query}`
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

    const groups = data.value || []

    return {
      success: true,
      output: {
        groups,
        metadata: {
          count: groups.length,
          nextLink: data['@odata.nextLink'],
        },
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Operation success status' },
    output: {
      type: 'object',
      description: 'List of groups',
      properties: {
        groups: {
          type: 'array',
          description: 'Array of group objects',
          items: { type: 'json', description: 'Group object' },
        },
        metadata: {
          type: 'object',
          description: 'Response metadata',
          properties: {
            count: { type: 'number', description: 'Number of groups returned' },
            nextLink: { type: 'string', description: 'URL for next page of results', optional: true },
          },
        },
      },
    },
  },
}
