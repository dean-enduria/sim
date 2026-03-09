import { createLogger } from '@sim/logger'
import type {
  EnduriaListIncidentsParams,
  EnduriaListIncidentsResponse,
} from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaListIncidentsTool')

export const listIncidentsTool: ToolConfig<
  EnduriaListIncidentsParams,
  EnduriaListIncidentsResponse
> = {
  id: 'enduria_list_incidents',
  name: 'List Enduria Incidents',
  description: 'List incidents in Enduria with optional filters for severity and status',
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
    severity: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by incident severity (e.g., low, medium, high, critical)',
    },
    status: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by incident status (e.g., open, investigating, resolved, closed)',
    },
    limit: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of incidents to return',
    },
  },

  request: {
    url: (params) => {
      const baseUrl = params.apiUrl.replace(/\/$/, '')
      if (!baseUrl) {
        throw new Error('Enduria API URL is required')
      }
      const url = new URL(`${baseUrl}/api/unified-tickets`)
      url.searchParams.set('ticketType', 'incident')
      if (params.severity) url.searchParams.set('severity', params.severity)
      if (params.status) url.searchParams.set('status', params.status)
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

      const incidents = Array.isArray(data) ? data : data.incidents || data.tickets || []

      return {
        success: true,
        output: {
          incidents,
          metadata: {
            totalCount: Array.isArray(data)
              ? data.length
              : data.totalCount || incidents.length,
          },
        },
      }
    } catch (error) {
      logger.error('Enduria list incidents - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    incidents: {
      type: 'json',
      description: 'Array of Enduria incidents',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including total count',
    },
  },
}
