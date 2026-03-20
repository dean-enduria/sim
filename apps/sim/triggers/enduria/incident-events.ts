import { EnduriaIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'
import { incidentOutputs } from './utils'

function createIncidentTrigger(
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
    outputs: incidentOutputs,
    webhook: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
  }
}

export const enduriaIncidentCreatedTrigger = createIncidentTrigger(
  'enduria_incident_created',
  'Incident Created',
  'Trigger workflow when a new incident is created in Enduria'
)

export const enduriaIncidentTriggeredTrigger = createIncidentTrigger(
  'enduria_incident_triggered',
  'Incident Triggered',
  'Trigger workflow when an incident is triggered in Enduria'
)

export const enduriaIncidentUpdatedTrigger = createIncidentTrigger(
  'enduria_incident_updated',
  'Incident Updated',
  'Trigger workflow when an incident is updated in Enduria'
)

export const enduriaIncidentEscalatedTrigger = createIncidentTrigger(
  'enduria_incident_escalated',
  'Incident Escalated',
  'Trigger workflow when an incident is escalated in Enduria'
)

export const enduriaIncidentResolvedTrigger = createIncidentTrigger(
  'enduria_incident_resolved',
  'Incident Resolved',
  'Trigger workflow when an incident is resolved in Enduria'
)

export const enduriaIncidentAcknowledgedTrigger = createIncidentTrigger(
  'enduria_incident_acknowledged',
  'Incident Acknowledged',
  'Trigger workflow when an incident is acknowledged in Enduria'
)
