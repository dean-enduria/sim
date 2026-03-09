import { createLogger } from '@sim/logger'
import type { EnduriaUpdateAssetParams, EnduriaUpdateAssetResponse } from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaUpdateAssetTool')

export const updateAssetTool: ToolConfig<
  EnduriaUpdateAssetParams,
  EnduriaUpdateAssetResponse
> = {
  id: 'enduria_update_asset',
  name: 'Update Enduria Asset',
  description: 'Update an existing IT asset in Enduria',
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
    assetId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'ID of the asset to update',
    },
    fields: {
      type: 'json',
      required: true,
      visibility: 'user-or-llm',
      description:
        'Fields to update as JSON object (e.g., {"status": "retired", "assignedTo": "user123"})',
    },
  },

  request: {
    url: (params) => {
      const baseUrl = params.apiUrl.replace(/\/$/, '')
      if (!baseUrl) {
        throw new Error('Enduria API URL is required')
      }
      if (!params.assetId) {
        throw new Error('Asset ID is required')
      }
      return `${baseUrl}/api/assets/${params.assetId}`
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

  transformResponse: async (response: Response, params?: EnduriaUpdateAssetParams) => {
    try {
      const data = await response.json()

      if (!response.ok) {
        const error = data.error || data
        throw new Error(typeof error === 'string' ? error : error.message || JSON.stringify(error))
      }

      return {
        success: true,
        output: {
          asset: data,
          metadata: {
            assetId: params?.assetId || '',
            updatedFields: params ? Object.keys(params.fields || {}) : [],
          },
        },
      }
    } catch (error) {
      logger.error('Enduria update asset - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    asset: {
      type: 'json',
      description: 'Updated Enduria asset',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including updated field names',
    },
  },
}
