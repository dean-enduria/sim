import { EnduriaIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'
import { opsOutputs } from './utils'

function createOpsTrigger(
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
    outputs: opsOutputs,
    webhook: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
  }
}

// Project triggers
export const enduriaProjectCreatedTrigger = createOpsTrigger(
  'enduria_project_created',
  'Project Created',
  'Trigger workflow when a new project is created in Enduria'
)

export const enduriaProjectTaskCompletedTrigger = createOpsTrigger(
  'enduria_project_task_completed',
  'Project Task Completed',
  'Trigger workflow when a project task is completed in Enduria'
)

export const enduriaProjectTaskOverdueTrigger = createOpsTrigger(
  'enduria_project_task_overdue',
  'Project Task Overdue',
  'Trigger workflow when a project task becomes overdue in Enduria'
)

export const enduriaProjectMilestoneReachedTrigger = createOpsTrigger(
  'enduria_project_milestone_reached',
  'Project Milestone Reached',
  'Trigger workflow when a project milestone is reached in Enduria'
)

// SLA triggers
export const enduriaSlaBrechedTrigger = createOpsTrigger(
  'enduria_sla_breached',
  'SLA Breached',
  'Trigger workflow when an SLA is breached in Enduria'
)

export const endurialSlaWarningTrigger = createOpsTrigger(
  'enduria_sla_warning',
  'SLA Warning',
  'Trigger workflow when an SLA warning threshold is reached in Enduria'
)

// Client triggers
export const enduriaClientCreatedTrigger = createOpsTrigger(
  'enduria_client_created',
  'Client Created',
  'Trigger workflow when a new client is created in Enduria'
)

export const enduriaClientUpdatedTrigger = createOpsTrigger(
  'enduria_client_updated',
  'Client Updated',
  'Trigger workflow when a client is updated in Enduria'
)
