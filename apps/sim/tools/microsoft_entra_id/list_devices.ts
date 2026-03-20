import { createLogger } from '@sim/logger'
import type {
  ListDevicesParams,
  ListDevicesResponse,
} from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EntraIdListDevices')

export const listDevicesTool: ToolConfig<ListDevicesParams, ListDevicesResponse> = {
  id: 'microsoft_entra_id_list_devices',
  name: 'List Entra ID Devices',
  description:
    'List devices registered in Microsoft Entra ID. Optionally filter, select properties, or limit results.',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'OAuth access token for Microsoft Graph API',
    },
    filter: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description:
        "OData filter expression (e.g., \"operatingSystem eq 'Windows'\")",
    },
    select: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description:
        'Comma-separated list of properties to select (e.g., id,displayName,operatingSystem)',
    },
    top: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Maximum number of devices to return',
    },
  },

  request: {
    url: (params) => {
      const url = new URL('https://graph.microsoft.com/v1.0/devices')
      if (params.filter) url.searchParams.set('$filter', params.filter)
      if (params.select) url.searchParams.set('$select', params.select)
      if (params.top) url.searchParams.set('$top', params.top)
      return url.toString()
    },
    method: 'GET',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()

    if (!response.ok) {
      logger.error('List devices failed', { status: response.status, error: data.error })
      throw new Error(data.error?.message || JSON.stringify(data))
    }

    const devices = data.value || []

    return {
      success: true,
      output: {
        devices,
        metadata: {
          count: devices.length,
          nextLink: data['@odata.nextLink'],
        },
      },
    }
  },

  outputs: {
    devices: {
      type: 'json',
      description: 'Array of Entra ID devices',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including count and pagination link',
    },
  },
}
