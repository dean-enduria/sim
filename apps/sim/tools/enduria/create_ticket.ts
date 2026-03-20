import { createLogger } from '@sim/logger'
import type { EnduriaCreateTicketParams, EnduriaCreateTicketResponse } from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaCreateTicketTool')

export const createTicketTool: ToolConfig<
  EnduriaCreateTicketParams,
  EnduriaCreateTicketResponse
> = {
  id: 'enduria_create_ticket',
  name: 'Create Enduria Ticket',
  description: 'Create a new ITSM ticket in Enduria',
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
    title: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Ticket title or summary',
    },
    description: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Detailed description of the ticket',
    },
    priority: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Ticket priority (e.g., low, medium, high, critical)',
    },
    category: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Ticket category (e.g., hardware, software, network, access)',
    },
    assignee: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'User ID or email to assign the ticket to',
    },
  },

  request: {
    url: (params) => {
      const baseUrl = params.apiUrl.replace(/\/$/, '')
      if (!baseUrl) {
        throw new Error('Enduria API URL is required')
      }
      return `${baseUrl}/api/unified-tickets`
    },
    method: 'POST',
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
      const body: Record<string, any> = {
        type: 'ticket',
        title: params.title,
        description: params.description,
      }
      if (params.priority) body.priority = params.priority
      if (params.category) body.category = params.category
      if (params.assignee) body.assignedTo = params.assignee
      return body
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
          metadata: {
            ticketId: data.id || data.ticketId || '',
          },
        },
      }
    } catch (error) {
      logger.error('Enduria create ticket - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    ticket: {
      type: 'json',
      description: 'Created Enduria ticket with ID and fields',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including ticket ID',
    },
  },
}
