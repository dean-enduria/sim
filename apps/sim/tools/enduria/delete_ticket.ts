import { createLogger } from '@sim/logger'
import type { EnduriaDeleteTicketParams, EnduriaDeleteTicketResponse } from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaDeleteTicketTool')

export const deleteTicketTool: ToolConfig<EnduriaDeleteTicketParams, EnduriaDeleteTicketResponse> = {
  id: 'enduria_delete_ticket',
  name: 'Delete Enduria Ticket',
  description: 'Delete an ITSM ticket from Enduria by ID',
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
      description: 'ID of the ticket to delete',
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
    method: 'DELETE',
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
      if (!response.ok) {
        const data = await response.json()
        const error = data.error || data
        throw new Error(typeof error === 'string' ? error : error.message || JSON.stringify(error))
      }

      return {
        success: true,
        output: {
          success: true,
          metadata: {
            ticketId: '',
          },
        },
      }
    } catch (error) {
      logger.error('Enduria delete ticket - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the ticket was successfully deleted',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including ticket ID',
    },
  },
}
