import { createLogger } from '@sim/logger'
import type {
  EnduriaUpdateIncidentParams,
  EnduriaUpdateIncidentResponse,
} from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaUpdateIncidentTool')

export const updateIncidentTool: ToolConfig<
  EnduriaUpdateIncidentParams,
  EnduriaUpdateIncidentResponse
> = {
  id: 'enduria_update_incident',
  name: 'Update Enduria Incident',
  description: 'Update an existing incident in Enduria',
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
    incidentId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'ID of the incident to update',
    },
    fields: {
      type: 'json',
      required: true,
      visibility: 'user-or-llm',
      description:
        'Fields to update as JSON object (e.g., {"status": "resolved", "severity": "low"})',
    },
  },

  request: {
    url: (params) => {
      const baseUrl = params.apiUrl.replace(/\/$/, '')
      if (!baseUrl) {
        throw new Error('Enduria API URL is required')
      }
      if (!params.incidentId) {
        throw new Error('Incident ID is required')
      }
      return `${baseUrl}/api/unified-tickets/${params.incidentId}`
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

  transformResponse: async (response: Response, params?: EnduriaUpdateIncidentParams) => {
    try {
      const data = await response.json()

      if (!response.ok) {
        const error = data.error || data
        throw new Error(typeof error === 'string' ? error : error.message || JSON.stringify(error))
      }

      return {
        success: true,
        output: {
          incident: data,
          metadata: {
            incidentId: params?.incidentId || '',
            updatedFields: params ? Object.keys(params.fields || {}) : [],
          },
        },
      }
    } catch (error) {
      logger.error('Enduria update incident - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    incident: {
      type: 'json',
      description: 'Updated Enduria incident',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including updated field names',
    },
  },
}
