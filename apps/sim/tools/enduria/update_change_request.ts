import { createLogger } from '@sim/logger'
import type {
  EnduriaUpdateChangeRequestParams,
  EnduriaUpdateChangeRequestResponse,
} from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaUpdateChangeRequestTool')

export const updateChangeRequestTool: ToolConfig<
  EnduriaUpdateChangeRequestParams,
  EnduriaUpdateChangeRequestResponse
> = {
  id: 'enduria_update_change_request',
  name: 'Update Enduria Change Request',
  description: 'Update an existing change request in Enduria',
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
      description: 'ID of the change request to update',
    },
    fields: {
      type: 'json',
      required: true,
      visibility: 'user-or-llm',
      description:
        'Fields to update as JSON object (e.g., {"status": "approved", "riskLevel": "low"})',
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

  transformResponse: async (response: Response, params?: EnduriaUpdateChangeRequestParams) => {
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
            changeRequestId: params?.changeRequestId || '',
            updatedFields: params ? Object.keys(params.fields || {}) : [],
          },
        },
      }
    } catch (error) {
      logger.error('Enduria update change request - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    changeRequest: {
      type: 'json',
      description: 'Updated Enduria change request',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including updated field names',
    },
  },
}
