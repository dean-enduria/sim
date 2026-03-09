import { createLogger } from '@sim/logger'
import type { EnduriaAddCommentParams, EnduriaAddCommentResponse } from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaAddCommentTool')

export const addCommentTool: ToolConfig<EnduriaAddCommentParams, EnduriaAddCommentResponse> = {
  id: 'enduria_add_comment',
  name: 'Add Comment to Enduria Ticket',
  description: 'Add a comment to an existing ITSM ticket in Enduria',
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
    ticketId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'ID of the ticket to add a comment to',
    },
    content: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Comment content text',
    },
    isInternal: {
      type: 'boolean',
      required: false,
      visibility: 'user-or-llm',
      description: 'Whether the comment is internal (not visible to end user)',
    },
  },

  request: {
    url: (params) => {
      const baseUrl = params.apiUrl.replace(/\/$/, '')
      if (!baseUrl) {
        throw new Error('Enduria API URL is required')
      }
      if (!params.ticketId) {
        throw new Error('Ticket ID is required')
      }
      return `${baseUrl}/api/unified-tickets/${params.ticketId}/comments`
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
    body: (params) => ({
      content: params.content,
      isInternal: params.isInternal || false,
    }),
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
          comment: data,
          metadata: {
            ticketId: data.ticketId || '',
            commentId: data.id || data.commentId || '',
          },
        },
      }
    } catch (error) {
      logger.error('Enduria add comment - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    comment: {
      type: 'json',
      description: 'Created comment data',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including ticket and comment IDs',
    },
  },
}
