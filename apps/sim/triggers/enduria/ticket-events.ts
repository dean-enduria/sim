import { EnduriaIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'
import { ticketOutputs } from './utils'

function createTicketTrigger(
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
    outputs: ticketOutputs,
    webhook: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
  }
}

export const enduriaTicketCreatedTrigger = createTicketTrigger(
  'enduria_ticket_created',
  'Ticket Created',
  'Trigger workflow when a new ticket is created in Enduria'
)

export const enduriaTicketUpdatedTrigger = createTicketTrigger(
  'enduria_ticket_updated',
  'Ticket Updated',
  'Trigger workflow when a ticket is updated in Enduria'
)

export const enduriaTicketAssignedTrigger = createTicketTrigger(
  'enduria_ticket_assigned',
  'Ticket Assigned',
  'Trigger workflow when a ticket is assigned in Enduria'
)

export const enduriaTicketEscalatedTrigger = createTicketTrigger(
  'enduria_ticket_escalated',
  'Ticket Escalated',
  'Trigger workflow when a ticket is escalated in Enduria'
)

export const enduriaTicketResolvedTrigger = createTicketTrigger(
  'enduria_ticket_resolved',
  'Ticket Resolved',
  'Trigger workflow when a ticket is resolved in Enduria'
)

export const enduriaTicketReopenedTrigger = createTicketTrigger(
  'enduria_ticket_reopened',
  'Ticket Reopened',
  'Trigger workflow when a ticket is reopened in Enduria'
)

export const enduriaTicketCommentedTrigger = createTicketTrigger(
  'enduria_ticket_commented',
  'Ticket Commented',
  'Trigger workflow when a comment is added to a ticket in Enduria'
)

export const enduriaTicketPriorityChangedTrigger = createTicketTrigger(
  'enduria_ticket_priority_changed',
  'Ticket Priority Changed',
  'Trigger workflow when a ticket priority is changed in Enduria'
)

export const enduriaTicketStatusChangedTrigger = createTicketTrigger(
  'enduria_ticket_status_changed',
  'Ticket Status Changed',
  'Trigger workflow when a ticket status is changed in Enduria'
)
