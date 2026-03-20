import { EnduriaIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'
import { changeOutputs } from './utils'

function createChangeTrigger(
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
    outputs: changeOutputs,
    webhook: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
  }
}

export const enduriaChangeCreatedTrigger = createChangeTrigger(
  'enduria_change_created',
  'Change Created',
  'Trigger workflow when a new change request is created in Enduria'
)

export const enduriaChangeSubmittedTrigger = createChangeTrigger(
  'enduria_change_submitted',
  'Change Submitted',
  'Trigger workflow when a change request is submitted for approval in Enduria'
)

export const enduriaChangeApprovedTrigger = createChangeTrigger(
  'enduria_change_approved',
  'Change Approved',
  'Trigger workflow when a change request is approved in Enduria'
)

export const enduriaChangeRejectedTrigger = createChangeTrigger(
  'enduria_change_rejected',
  'Change Rejected',
  'Trigger workflow when a change request is rejected in Enduria'
)

export const enduriaChangeImplementedTrigger = createChangeTrigger(
  'enduria_change_implemented',
  'Change Implemented',
  'Trigger workflow when a change request is implemented in Enduria'
)

export const enduriaChangeClosedTrigger = createChangeTrigger(
  'enduria_change_closed',
  'Change Closed',
  'Trigger workflow when a change request is closed in Enduria'
)
