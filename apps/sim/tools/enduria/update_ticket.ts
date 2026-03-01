import { createLogger } from '@sim/logger'
import type { EnduriaUpdateTicketParams, EnduriaUpdateTicketResponse } from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaUpdateTicketTool')

export const updateTicketTool: ToolConfig<
  EnduriaUpdateTicketParams,
  EnduriaUpdateTicketResponse
> = {
  id: 'enduria_update_ticket',
  name: 'Update Enduria Ticket',
  description: 'Update an existing ITSM ticket in Enduria',
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
      description: 'ID of the ticket to update',
    },
    fields: {
      type: 'json',
      required: true,
      visibility: 'user-or-llm',
      description:
        'Fields to update as JSON object (e.g., {"status": "in_progress", "priority": "high"})',
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
    method: 'PATCH',
    headers: (params) => {
      if (!params.apiSecret) {
        throw new Error('Enduria API secret is required')
      }
      return {
        'x-internal-api-secret': params.apiSecret,
        'x-org-id': params.orgId,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
    },
    body: (params) => {
      if (!params.fields || typeof params.fields !== 'object') {
        throw new Error('Fields must be a JSON object')
      }
      return params.fields
    },
  },

  transformResponse: async (response: Response, params?: EnduriaUpdateTicketParams) => {
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
          metadata: {
            ticketId: params?.ticketId || '',
            updatedFields: params ? Object.keys(params.fields || {}) : [],
          },
        },
      }
    } catch (error) {
      logger.error('Enduria update ticket - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    ticket: {
      type: 'json',
      description: 'Updated Enduria ticket',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including updated field names',
    },
  },
}
