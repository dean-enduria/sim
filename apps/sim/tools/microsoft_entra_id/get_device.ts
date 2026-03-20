import { createLogger } from '@sim/logger'
import type {
  GetDeviceParams,
  GetDeviceResponse,
} from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EntraIdGetDevice')

export const getDeviceTool: ToolConfig<GetDeviceParams, GetDeviceResponse> = {
  id: 'microsoft_entra_id_get_device',
  name: 'Get Entra ID Device',
  description:
    'Get a specific device by ID from Microsoft Entra ID.',
  version: '1.0.0',

  oauth: { required: true, provider: 'microsoft-entra-id' },

  params: {
    accessToken: {
      type: 'string',
      required: true,
      visibility: 'hidden',
      description: 'OAuth access token for Microsoft Graph API',
    },
    deviceId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'The ID of the device to retrieve',
    },
    select: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description:
        'Comma-separated list of properties to select (e.g., id,displayName,operatingSystem)',
    },
  },

  request: {
    url: (params) => {
      const url = new URL(
        `https://graph.microsoft.com/v1.0/devices/${encodeURIComponent(params.deviceId)}`
      )
      if (params.select) url.searchParams.set('$select', params.select)
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
      logger.error('Get device failed', { status: response.status, error: data.error })
      throw new Error(data.error?.message || JSON.stringify(data))
    }

    return {
      success: true,
      output: {
        device: data,
      },
    }
  },

  outputs: {
    device: {
      type: 'json',
      description: 'The device object',
    },
  },
}
