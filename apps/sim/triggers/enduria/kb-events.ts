import { EnduriaIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'
import { kbOutputs } from './utils'

function createKbTrigger(
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
    outputs: kbOutputs,
    webhook: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
  }
}

export const enduriaKbArticlePublishedTrigger = createKbTrigger(
  'enduria_kb_article_published',
  'KB Article Published',
  'Trigger workflow when a knowledge base article is published in Enduria'
)

export const enduriaKbArticleUpdatedTrigger = createKbTrigger(
  'enduria_kb_article_updated',
  'KB Article Updated',
  'Trigger workflow when a knowledge base article is updated in Enduria'
)

export const enduriaKbArticleArchivedTrigger = createKbTrigger(
  'enduria_kb_article_archived',
  'KB Article Archived',
  'Trigger workflow when a knowledge base article is archived in Enduria'
)

export const enduriaKbArticleDeletedTrigger = createKbTrigger(
  'enduria_kb_article_deleted',
  'KB Article Deleted',
  'Trigger workflow when a knowledge base article is deleted in Enduria'
)
