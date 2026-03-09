import { createLogger } from '@sim/logger'
import type { EnduriaGetArticleParams, EnduriaGetArticleResponse } from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaGetArticleTool')

export const getArticleTool: ToolConfig<EnduriaGetArticleParams, EnduriaGetArticleResponse> = {
  id: 'enduria_get_article',
  name: 'Get Enduria KB Article',
  description: 'Retrieve a knowledge base article from Enduria',
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
    articleId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'ID of the knowledge base article to retrieve',
    },
  },

  request: {
    url: (params) => {
      const baseUrl = params.apiUrl.replace(/\/$/, '')
      if (!baseUrl) {
        throw new Error('Enduria API URL is required')
      }
      if (!params.articleId) {
        throw new Error('Article ID is required')
      }
      return `${baseUrl}/api/knowledge-base/${params.articleId}`
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
          article: data,
        },
      }
    } catch (error) {
      logger.error('Enduria get article - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    article: {
      type: 'json',
      description: 'Enduria knowledge base article with all fields',
    },
  },
}
