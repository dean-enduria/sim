import { createLogger } from '@sim/logger'
import type {
  EnduriaCreateIncidentParams,
  EnduriaCreateIncidentResponse,
} from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaCreateIncidentTool')

export const createIncidentTool: ToolConfig<
  EnduriaCreateIncidentParams,
  EnduriaCreateIncidentResponse
> = {
  id: 'enduria_create_incident',
  name: 'Create Enduria Incident',
  description: 'Create a new incident in Enduria for tracking service disruptions',
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
      description: 'Incident title or summary',
    },
    description: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Detailed description of the incident',
    },
    severity: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Incident severity (e.g., low, medium, high, critical)',
    },
    affectedService: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Name or ID of the affected service',
    },
    reportedBy: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'User ID or email of the person reporting the incident',
    },
    impact: {
      type: 'string',
      required: false,
      description: 'Impact level (low, medium, high, critical)',
    },
    urgency: {
      type: 'string',
      required: false,
      description: 'Urgency level (low, medium, high, critical)',
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
        type: 'incident',
        title: params.title,
        description: params.description,
      }
      if (params.severity) body.severity = params.severity
      if (params.affectedService) body.affectedServices = [params.affectedService]
      if (params.reportedBy) body.reportedBy = params.reportedBy
      body.impact = params.impact || 'medium'
      body.urgency = params.urgency || 'medium'
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
          incident: data,
          metadata: {
            incidentId: data.id || data.incidentId || '',
          },
        },
      }
    } catch (error) {
      logger.error('Enduria create incident - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    incident: {
      type: 'json',
      description: 'Created Enduria incident with ID and fields',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including incident ID',
    },
  },
}
