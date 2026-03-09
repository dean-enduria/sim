import { createLogger } from '@sim/logger'
import type { EnduriaListAssetsParams, EnduriaListAssetsResponse } from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaListAssetsTool')

export const listAssetsTool: ToolConfig<
  EnduriaListAssetsParams,
  EnduriaListAssetsResponse
> = {
  id: 'enduria_list_assets',
  name: 'List Enduria Assets',
  description: 'List IT assets in Enduria with optional filters',
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
    category: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by asset category (e.g., hardware, software, network)',
    },
    status: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by asset status (e.g., active, retired, maintenance)',
    },
    assignedTo: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by assigned user ID',
    },
    search: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Search term to filter assets',
    },
    limit: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of assets to return',
    },
  },

  request: {
    url: (params) => {
      const baseUrl = params.apiUrl.replace(/\/$/, '')
      if (!baseUrl) {
        throw new Error('Enduria API URL is required')
      }
      const url = new URL(`${baseUrl}/api/assets`)
      if (params.category) url.searchParams.set('category', params.category)
      if (params.status) url.searchParams.set('status', params.status)
      if (params.assignedTo) url.searchParams.set('assignedTo', params.assignedTo)
      if (params.search) url.searchParams.set('search', params.search)
      if (params.limit) url.searchParams.set('limit', String(params.limit))
      return url.toString()
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

      const assets = Array.isArray(data) ? data : data.assets || []

      return {
        success: true,
        output: {
          assets,
          metadata: {
            totalCount: Array.isArray(data) ? data.length : data.totalCount || assets.length,
          },
        },
      }
    } catch (error) {
      logger.error('Enduria list assets - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    assets: {
      type: 'json',
      description: 'Array of Enduria assets',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including total count',
    },
  },
}
