import { createLogger } from '@sim/logger'
import type { EnduriaListUsersParams, EnduriaListUsersResponse } from '@/tools/enduria/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EnduriaListUsersTool')

export const listUsersTool: ToolConfig<EnduriaListUsersParams, EnduriaListUsersResponse> = {
  id: 'enduria_list_users',
  name: 'List Enduria Users',
  description: 'List users in Enduria with optional filters',
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
    role: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by user role (e.g., admin, agent, user)',
    },
    isActive: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Filter by active status (true or false)',
    },
    search: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Search term to filter users by name or email',
    },
    limit: {
      type: 'number',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of users to return',
    },
  },

  request: {
    url: (params) => {
      const baseUrl = params.apiUrl.replace(/\/$/, '')
      if (!baseUrl) {
        throw new Error('Enduria API URL is required')
      }
      const url = new URL(`${baseUrl}/api/users`)
      if (params.role) url.searchParams.set('role', params.role)
      if (params.isActive) url.searchParams.set('isActive', params.isActive)
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

      const users = Array.isArray(data) ? data : data.users || []

      return {
        success: true,
        output: {
          users,
          metadata: {
            totalCount: Array.isArray(data) ? data.length : data.totalCount || users.length,
          },
        },
      }
    } catch (error) {
      logger.error('Enduria list users - Error processing response:', { error })
      throw error
    }
  },

  outputs: {
    users: {
      type: 'json',
      description: 'Array of Enduria users',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including total count',
    },
  },
}
