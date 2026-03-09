import { createLogger } from '@sim/logger'
import type {
  EnduriaCreateChangeRequestParams,
  EnduriaCreateChangeRequestResponse,
} from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaCreateChangeRequestTool')

export const createChangeRequestTool: ToolConfig<
  EnduriaCreateChangeRequestParams,
  EnduriaCreateChangeRequestResponse
> = {
  id: 'enduria_create_change_request',
  name: 'Create Enduria Change Request',
  description: 'Create a new change request in Enduria for tracking planned changes',
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
      description: 'Change request title or summary',
    },
    description: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Detailed description of the change request',
    },
    changeType: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Type of change (normal, standard, emergency)',
    },
    priority: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Change request priority (e.g., low, medium, high, critical)',
    },
    riskLevel: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Risk level of the change (e.g., low, medium, high)',
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
        title: params.title,
        description: params.description,
        ticketType: 'change',
      }
      if (params.changeType) body.changeType = params.changeType
      if (params.priority) body.priority = params.priority
      if (params.riskLevel) body.riskLevel = params.riskLevel
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
          changeRequest: data,
          metadata: {
            changeRequestId: data.id || data.changeRequestId || '',
          },
        },
      }
    } catch (error) {
      logger.error('Enduria create change request - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    changeRequest: {
      type: 'json',
      description: 'Created Enduria change request with ID and fields',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including change request ID',
    },
  },
}
