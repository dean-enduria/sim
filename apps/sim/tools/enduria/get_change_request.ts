import { createLogger } from '@sim/logger'
import type {
  EnduriaGetChangeRequestParams,
  EnduriaGetChangeRequestResponse,
} from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaGetChangeRequestTool')

export const getChangeRequestTool: ToolConfig<
  EnduriaGetChangeRequestParams,
  EnduriaGetChangeRequestResponse
> = {
  id: 'enduria_get_change_request',
  name: 'Get Enduria Change Request',
  description: 'Retrieve a change request from Enduria by ID',
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
    changeRequestId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'ID of the change request to retrieve',
    },
  },

  request: {
    url: (params) => {
      const baseUrl = params.apiUrl.replace(/\/$/, '')
      if (!baseUrl) {
        throw new Error('Enduria API URL is required')
      }
      if (!params.changeRequestId) {
        throw new Error('Change Request ID is required')
      }
      return `${baseUrl}/api/unified-tickets/${params.changeRequestId}`
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
          changeRequest: data,
        },
      }
    } catch (error) {
      logger.error('Enduria get change request - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    changeRequest: {
      type: 'json',
      description: 'Enduria change request with all fields',
    },
  },
}
