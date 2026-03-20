import { EnduriaIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'
import { webhookOutputs } from './utils'

export const enduriaWebhookTrigger: TriggerConfig = {
  id: 'enduria_webhook',
  name: 'Enduria Webhook',
  provider: 'enduria',
  description: 'Trigger workflow from any Enduria ITSM event',
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
      condition: { field: 'selectedTriggerId', value: 'enduria_webhook' },
    },
    {
      id: 'triggerSave',
      title: '',
      type: 'trigger-save',
      hideFromPreview: true,
      mode: 'trigger',
      triggerId: 'enduria_webhook',
      condition: { field: 'selectedTriggerId', value: 'enduria_webhook' },
    },
  ],

  outputs: webhookOutputs,

  webhook: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
}
