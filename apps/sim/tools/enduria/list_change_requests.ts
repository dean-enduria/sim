import { createLogger } from '@sim/logger'
import type {
  EnduriaListChangeRequestsParams,
  EnduriaListChangeRequestsResponse,
} from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaListChangeRequestsTool')

export const listChangeRequestsTool: ToolConfig<
  EnduriaListChangeRequestsParams,
  EnduriaListChangeRequestsResponse
> = {
  id: 'enduria_list_change_requests',
  name: 'List Enduria Change Requests',
  description: 'List change requests in Enduria with optional filters for status and priority',
  version: '1.0.0',

  params: {
    apiUrl: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Enduria API base URL (from ENDURIA_API_URL env var)',
    },
    apiSecret: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Internal API secret for authentication (from INTERNAL_API_SECRET env var)',
    },
    orgId: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'Organization ID to scope the request',
    },
    status: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by change request status (e.g., draft, submitted, approved, implemented, closed)',
    },
    priority: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by priority (e.g., low, medium, high, critical)',
    },
    limit: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of change requests to return',
    },
  },

  request: {
    url: (params) => {
      const baseUrl = params.apiUrl.replace(/\/$/, '')
      if (!baseUrl) {
        throw new Error('Enduria API URL is required')
      }
      const url = new URL(`${baseUrl}/api/unified-tickets`)
      url.searchParams.set('ticketType', 'change')
      if (params.status) url.searchParams.set('status', params.status)
      if (params.priority) url.searchParams.set('priority', params.priority)
      if (params.limit) url.searchParams.set('limit', String(params.limit))
      return url.toString()
    },
    method: 'GET',
    headers: (params) => {
      if (!params.apiSecret) {
        throw new Error('Enduria API secret is required')
      }
      return {
        'x-internal-api-secret': params.apiSecret,
        'x-org-id': params.orgId,
        Accept: 'application/json',
      }
    },
  },

  transformResponse: async (response: Response) => {
    try {
      const data = await response.json()

      if (!response.ok) {
        const error = data.error || data
        throw new Error(typeof error === 'string' ? error : error.message || JSON.stringify(error))
      }

      const changeRequests = Array.isArray(data) ? data : data.changeRequests || data.tickets || []

      return {
        success: true,
        output: {
          changeRequests,
          metadata: {
            totalCount: Array.isArray(data)
              ? data.length
              : data.totalCount || changeRequests.length,
          },
        },
      }
    } catch (error) {
      logger.error('Enduria list change requests - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    changeRequests: {
      type: 'json',
      description: 'Array of Enduria change requests',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including total count',
    },
  },
}
