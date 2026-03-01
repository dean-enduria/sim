import { createLogger } from '@sim/logger'
import type { EnduriaSearchKBParams, EnduriaSearchKBResponse } from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaSearchKBTool')

export const searchKnowledgeBaseTool: ToolConfig<
  EnduriaSearchKBParams,
  EnduriaSearchKBResponse
> = {
  id: 'enduria_search_knowledge_base',
  name: 'Search Enduria Knowledge Base',
  description: 'Search the Enduria knowledge base for articles and solutions',
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
    query: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Search query string',
    },
    limit: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of results to return (default: 10)',
    },
    category: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter results by category',
    },
  },

  request: {
    url: (params) => {
      const baseUrl = params.apiUrl.replace(/\/$/, '')
      if (!baseUrl) {
        throw new Error('Enduria API URL is required')
      }

      const queryParams = new URLSearchParams()
      queryParams.append('q', params.query)

      if (params.limit) {
        queryParams.append('limit', params.limit.toString())
      }
      if (params.category) {
        queryParams.append('category', params.category)
      }

      return `${baseUrl}/api/knowledge-base/search?${queryParams.toString()}`
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

      const results = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []

      return {
        success: true,
        output: {
          results,
          metadata: {
            resultCount: results.length,
          },
        },
      }
    } catch (error) {
      logger.error('Enduria search knowledge base - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    results: {
      type: 'array',
      description: 'Array of knowledge base articles matching the query',
    },
    metadata: {
      type: 'json',
      description: 'Search metadata including result count',
    },
  },
}
