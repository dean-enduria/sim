import { createLogger } from '@sim/logger'
import type {
  EnableDisableDeviceParams,
  EnableDisableDeviceResponse,
} from '@/tools/microsoft_entra_id/types'
import type { ToolConfig } from '@/tools/types'

const logger = createLogger('EntraIdEnableDisableDevice')

export const enableDisableDeviceTool: ToolConfig<
  EnableDisableDeviceParams,
  EnableDisableDeviceResponse
> = {
  id: 'microsoft_entra_id_enable_disable_device',
  name: 'Enable/Disable Entra ID Device',
  description:
    'Enable or disable a device in Microsoft Entra ID by updating its accountEnabled property.',
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
      description: 'The ID of the device to enable or disable',
    },
    accountEnabled: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: "Set to 'true' to enable or 'false' to disable the device",
    },
  },

  request: {
    url: (params) =>
      `https://graph.microsoft.com/v1.0/devices/${encodeURIComponent(params.deviceId)}`,
    method: 'PATCH',
    headers: (params) => ({
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    }),
    body: (params) => ({
      accountEnabled: params.accountEnabled === 'true',
    }),
  },

  transformResponse: async (response: Response, params?: EnableDisableDeviceParams) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      logger.error('Enable/disable device failed', { status: response.status, error: data.error })
      throw new Error(data.error?.message || JSON.stringify(data))
    }

    return {
      success: true,
      output: {
        success: true,
        metadata: {
          deviceId: params?.deviceId ?? '',
          accountEnabled: params?.accountEnabled === 'true',
        },
      },
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the device was successfully updated',
    },
    metadata: {
      type: 'json',
      description: 'Operation metadata including device ID and new enabled state',
    },
  },
}
