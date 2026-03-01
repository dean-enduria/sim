import { createLogger } from '@sim/logger'
import type { EnduriaGetTicketParams, EnduriaGetTicketResponse } from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaGetTicketTool')

export const getTicketTool: ToolConfig<EnduriaGetTicketParams, EnduriaGetTicketResponse> = {
  id: 'enduria_get_ticket',
  name: 'Get Enduria Ticket',
  description: 'Retrieve an ITSM ticket from Enduria by ID',
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
    ticketId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'ID of the ticket to retrieve',
    },
  },

  request: {
    url: (params) => {
      const baseUrl = params.apiUrl.replace(/\/$/, '')
      if (!baseUrl) {
        throw new Error('Enduria API URL is required')
      }
      if (!params.ticketId) {
        throw new Error('Ticket ID is required')
      }
      return `${baseUrl}/api/tickets/${params.ticketId}`
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

      return {
        success: true,
        output: {
          ticket: data,
        },
      }
    } catch (error) {
      logger.error('Enduria get ticket - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    ticket: {
      type: 'json',
      description: 'Enduria ticket with all fields',
    },
  },
}
