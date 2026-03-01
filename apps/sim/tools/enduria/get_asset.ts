import { createLogger } from '@sim/logger'
import type { EnduriaGetAssetParams, EnduriaGetAssetResponse } from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaGetAssetTool')

export const getAssetTool: ToolConfig<EnduriaGetAssetParams, EnduriaGetAssetResponse> = {
  id: 'enduria_get_asset',
  name: 'Get Enduria Asset',
  description: 'Retrieve an IT asset from the Enduria asset inventory',
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
      description: 'ID of the asset to retrieve',
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
          asset: data,
        },
      }
    } catch (error) {
      logger.error('Enduria get asset - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    asset: {
      type: 'json',
      description: 'Enduria asset with all fields',
    },
  },
}
