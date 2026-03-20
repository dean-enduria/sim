import { createLogger } from '@sim/logger'
import type { CreateGroupParams, CreateGroupResponse } from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('MicrosoftEntraIdGroups')

export const microsoftEntraIdCreateGroupTool: ToolConfig<CreateGroupParams, CreateGroupResponse> = {
  id: 'microsoft_entra_id_create_group',
  name: 'Create Group in Microsoft Entra ID',
  description: 'Create a new group in Microsoft Entra ID (security group or Microsoft 365 group)',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: { type: 'string', required: true, visibility: 'hidden' },
    displayName: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Display name for the group',
    },
    description: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Description of the group',
    },
    mailNickname: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Mail alias for the group (no spaces)',
    },
    groupType: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Type of group: "security" or "microsoft365"',
    },
    mailEnabled: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Whether to enable mail for the group ("true" or "false")',
    },
  },

  request: {
    url: () => 'https://graph.microsoft.com/v1.0/groups',
    method: 'POST',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params) => {
      const isMicrosoft365 = params.groupType === 'microsoft365'
      return {
        displayName: params.displayName,
        ...(params.description && { description: params.description }),
        mailNickname: params.mailNickname,
        mailEnabled: isMicrosoft365 || params.mailEnabled === 'true',
        securityEnabled: !isMicrosoft365,
        groupTypes: isMicrosoft365 ? ['Unified'] : [],
      }
    },
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      logger.error('Microsoft Entra ID API request failed', { data, status: response.status })
      throw new Error(data.error?.message || JSON.stringify(data))
    }

    return {
      success: true,
      output: {
        group: data,
        metadata: {
          groupId: data.id,
        },
      },
    }
  },

  outputs: {
    success: { type: 'boolean', description: 'Operation success status' },
    output: {
      type: 'object',
      description: 'Created group data',
      properties: {
        group: { type: 'json', description: 'Created group object' },
        metadata: {
          type: 'object',
          description: 'Response metadata',
          properties: {
            groupId: { type: 'string', description: 'ID of the created group' },
          },
        },
      },
    },
  },
}
