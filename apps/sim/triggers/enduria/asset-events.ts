import { EnduriaIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'
import { assetOutputs } from './utils'

function createAssetTrigger(
  id: string,
  name: string,
  description: string
): TriggerConfig {
  return {
    id,
    name,
    provider: 'enduria',
    description,
    version: '1.0.0',
    icon: EnduriaIcon,
    subBlocks: [
      {
        id: 'webhookUrlDisplay',
        title: 'Webhook URL',
        type: 'short-input',
        readOnly: true,
        showCopyButton: true,
        useWebhookUrl: true,
        placeholder: 'Webhook URL will be generated on deploy',
        mode: 'trigger',
        condition: { field: 'selectedTriggerId', value: id },
      },
      {
        id: 'triggerSave',
        title: '',
        type: 'trigger-save',
        hideFromPreview: true,
        mode: 'trigger',
        triggerId: id,
        condition: { field: 'selectedTriggerId', value: id },
      },
    ],
    outputs: assetOutputs,
    webhook: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
  }
}

export const enduriaAssetCreatedTrigger = createAssetTrigger(
  'enduria_asset_created',
  'Asset Created',
  'Trigger workflow when a new asset is created in Enduria'
)

export const enduriaAssetUpdatedTrigger = createAssetTrigger(
  'enduria_asset_updated',
  'Asset Updated',
  'Trigger workflow when an asset is updated in Enduria'
)

export const enduriaAssetDiscoveredTrigger = createAssetTrigger(
  'enduria_asset_discovered',
  'Asset Discovered',
  'Trigger workflow when a new asset is discovered in Enduria'
)

export const enduriaAssetRetiredTrigger = createAssetTrigger(
  'enduria_asset_retired',
  'Asset Retired',
  'Trigger workflow when an asset is retired in Enduria'
)

export const enduriaAssetMaintenanceDueTrigger = createAssetTrigger(
  'enduria_asset_maintenance_due',
  'Asset Maintenance Due',
  'Trigger workflow when an asset maintenance is due in Enduria'
)
