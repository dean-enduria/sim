import { createLogger } from '@sim/logger'
import type { EnduriaListTicketsParams, EnduriaListTicketsResponse } from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaListTicketsTool')

export const listTicketsTool: ToolConfig<
  EnduriaListTicketsParams,
  EnduriaListTicketsResponse
> = {
  id: 'enduria_list_tickets',
  name: 'List Enduria Tickets',
  description: 'List ITSM tickets in Enduria with optional filters',
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
      description: 'Filter by ticket status (e.g., open, in_progress, resolved, closed)',
    },
    priority: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by ticket priority (e.g., low, medium, high, critical)',
    },
    assignedTo: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by assigned user ID',
    },
    limit: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of tickets to return',
    },
  },

  request: {
    url: (params) => {
      const baseUrl = params.apiUrl.replace(/\/$/, '')
      if (!baseUrl) {
        throw new Error('Enduria API URL is required')
      }
      const url = new URL(`${baseUrl}/api/tickets`)
      if (params.status) url.searchParams.set('status', params.status)
      if (params.priority) url.searchParams.set('priority', params.priority)
      if (params.assignedTo) url.searchParams.set('assignedTo', params.assignedTo)
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

      const tickets = Array.isArray(data) ? data : data.tickets || []

      return {
        success: true,
        output: {
          tickets,
          metadata: {
            totalCount: Array.isArray(data) ? data.length : data.totalCount || tickets.length,
          },
        },
      }
    } catch (error) {
      logger.error('Enduria list tickets - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    tickets: {
      type: 'json',
      description: 'Array of Enduria tickets',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including total count',
    },
  },
}
