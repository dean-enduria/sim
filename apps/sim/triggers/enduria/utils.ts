/**
 * Enduria trigger event matching utilities
 */

/**
 * Dropdown options for the trigger type selector in the Enduria block
 */
export const enduriaTriggerOptions = [
  { label: 'All Events (Webhook)', id: 'enduria_webhook' },
  { label: 'Ticket Created', id: 'enduria_ticket_created' },
  { label: 'Ticket Updated', id: 'enduria_ticket_updated' },
  { label: 'Ticket Assigned', id: 'enduria_ticket_assigned' },
  { label: 'Ticket Escalated', id: 'enduria_ticket_escalated' },
  { label: 'Ticket Resolved', id: 'enduria_ticket_resolved' },
  { label: 'Ticket Reopened', id: 'enduria_ticket_reopened' },
  { label: 'Ticket Commented', id: 'enduria_ticket_commented' },
  { label: 'Ticket Priority Changed', id: 'enduria_ticket_priority_changed' },
  { label: 'Ticket Status Changed', id: 'enduria_ticket_status_changed' },
  { label: 'Incident Created', id: 'enduria_incident_created' },
  { label: 'Incident Triggered', id: 'enduria_incident_triggered' },
  { label: 'Incident Updated', id: 'enduria_incident_updated' },
  { label: 'Incident Escalated', id: 'enduria_incident_escalated' },
  { label: 'Incident Resolved', id: 'enduria_incident_resolved' },
  { label: 'Incident Acknowledged', id: 'enduria_incident_acknowledged' },
  { label: 'Change Created', id: 'enduria_change_created' },
  { label: 'Change Submitted', id: 'enduria_change_submitted' },
  { label: 'Change Approved', id: 'enduria_change_approved' },
  { label: 'Change Rejected', id: 'enduria_change_rejected' },
  { label: 'Change Implemented', id: 'enduria_change_implemented' },
  { label: 'Change Closed', id: 'enduria_change_closed' },
  { label: 'Asset Created', id: 'enduria_asset_created' },
  { label: 'Asset Updated', id: 'enduria_asset_updated' },
  { label: 'Asset Discovered', id: 'enduria_asset_discovered' },
  { label: 'Asset Retired', id: 'enduria_asset_retired' },
  { label: 'Asset Maintenance Due', id: 'enduria_asset_maintenance_due' },
  { label: 'Article Published', id: 'enduria_kb_article_published' },
  { label: 'Article Updated', id: 'enduria_kb_article_updated' },
  { label: 'Article Archived', id: 'enduria_kb_article_archived' },
  { label: 'Article Deleted', id: 'enduria_kb_article_deleted' },
  { label: 'Project Created', id: 'enduria_project_created' },
  { label: 'Task Completed', id: 'enduria_project_task_completed' },
  { label: 'Task Overdue', id: 'enduria_project_task_overdue' },
  { label: 'Milestone Reached', id: 'enduria_project_milestone_reached' },
  { label: 'SLA Breached', id: 'enduria_sla_breached' },
  { label: 'SLA Warning', id: 'enduria_sla_warning' },
  { label: 'Client Created', id: 'enduria_client_created' },
  { label: 'Client Updated', id: 'enduria_client_updated' },
]

/**
 * Map of trigger IDs to their corresponding Enduria event types
 */
const TRIGGER_EVENT_MAP: Record<string, string> = {
  enduria_ticket_created: 'ticket.created',
  enduria_ticket_updated: 'ticket.updated',
  enduria_ticket_assigned: 'ticket.assigned',
  enduria_ticket_escalated: 'ticket.escalated',
  enduria_ticket_resolved: 'ticket.resolved',
  enduria_ticket_reopened: 'ticket.reopened',
  enduria_ticket_commented: 'ticket.commented',
  enduria_ticket_priority_changed: 'ticket.priority_changed',
  enduria_ticket_status_changed: 'ticket.status_changed',
  enduria_incident_created: 'incident.created',
  enduria_incident_triggered: 'incident.triggered',
  enduria_incident_updated: 'incident.updated',
  enduria_incident_escalated: 'incident.escalated',
  enduria_incident_resolved: 'incident.resolved',
  enduria_incident_acknowledged: 'incident.acknowledged',
  enduria_change_created: 'change.created',
  enduria_change_submitted: 'change.submitted',
  enduria_change_approved: 'change.approved',
  enduria_change_rejected: 'change.rejected',
  enduria_change_implemented: 'change.implemented',
  enduria_change_closed: 'change.closed',
  enduria_asset_created: 'asset.created',
  enduria_asset_updated: 'asset.updated',
  enduria_asset_discovered: 'asset.discovered',
  enduria_asset_retired: 'asset.retired',
  enduria_asset_maintenance_due: 'asset.maintenance_due',
  enduria_kb_article_published: 'kb.article.published',
  enduria_kb_article_updated: 'kb.article.updated',
  enduria_kb_article_archived: 'kb.article.archived',
  enduria_kb_article_deleted: 'kb.article.deleted',
  enduria_project_created: 'project.created',
  enduria_project_task_completed: 'project.task.completed',
  enduria_project_task_overdue: 'project.task.overdue',
  enduria_project_milestone_reached: 'project.milestone.reached',
  enduria_sla_breached: 'sla.breached',
  enduria_sla_warning: 'sla.warning',
  enduria_client_created: 'client.created',
  enduria_client_updated: 'client.updated',
}

/**
 * Check if an incoming Enduria event matches the expected trigger
 *
 * @param triggerId - The trigger configuration ID (e.g., 'enduria_ticket_created')
 * @param incomingEvent - The event type from the webhook payload (e.g., 'ticket.created')
 * @returns true if the event matches or if the trigger is a catch-all
 */
export function isEnduriaEventMatch(triggerId: string, incomingEvent: string): boolean {
  // Catch-all webhook trigger matches everything
  if (triggerId === 'enduria_webhook') return true

  const expectedEvent = TRIGGER_EVENT_MAP[triggerId]

  // Unknown trigger ID — allow through
  if (!expectedEvent) return true

  return expectedEvent === incomingEvent
}

/**
 * Shared ticket output schema used across ticket triggers
 */
export const ticketOutputs = {
  event: { type: 'string', description: 'The Enduria event type' },
  ticketId: { type: 'string', description: 'Unique ticket identifier' },
  ticketNumber: { type: 'string', description: 'Human-readable ticket number' },
  title: { type: 'string', description: 'Ticket title' },
  description: { type: 'string', description: 'Ticket description' },
  status: { type: 'string', description: 'Current ticket status' },
  priority: { type: 'string', description: 'Ticket priority level' },
  assignedTo: { type: 'string', description: 'User assigned to the ticket' },
  requesterId: { type: 'string', description: 'User who requested the ticket' },
  category: { type: 'string', description: 'Ticket category' },
  ticketType: { type: 'string', description: 'Type of ticket' },
  orgId: { type: 'string', description: 'Organization identifier' },
  actor: { type: 'string', description: 'User who triggered the event' },
  timestamp: { type: 'string', description: 'ISO 8601 event timestamp' },
  data: { type: 'json', description: 'Full event payload as JSON' },
} as const

/**
 * Shared incident output schema used across incident triggers
 */
export const incidentOutputs = {
  ...ticketOutputs,
  severity: { type: 'string', description: 'Incident severity level' },
  impact: { type: 'string', description: 'Incident impact assessment' },
  urgency: { type: 'string', description: 'Incident urgency level' },
  affectedServices: { type: 'string', description: 'Comma-separated list of affected services' },
} as const

/**
 * Shared change request output schema used across change triggers
 */
export const changeOutputs = {
  ...ticketOutputs,
  risk: { type: 'string', description: 'Change risk level' },
  changeType: { type: 'string', description: 'Type of change (normal, standard, emergency)' },
  backoutPlan: { type: 'string', description: 'Rollback plan for the change' },
  plannedStartDate: { type: 'string', description: 'Planned start date for the change' },
  plannedEndDate: { type: 'string', description: 'Planned end date for the change' },
} as const

/**
 * Shared asset output schema used across asset triggers
 */
export const assetOutputs = {
  event: { type: 'string', description: 'The Enduria event type' },
  assetId: { type: 'string', description: 'Unique asset identifier' },
  name: { type: 'string', description: 'Asset name' },
  category: { type: 'string', description: 'Asset category' },
  status: { type: 'string', description: 'Current asset status' },
  manufacturer: { type: 'string', description: 'Asset manufacturer' },
  model: { type: 'string', description: 'Asset model' },
  serialNumber: { type: 'string', description: 'Asset serial number' },
  location: { type: 'string', description: 'Asset location' },
  assignedTo: { type: 'string', description: 'User assigned to the asset' },
  orgId: { type: 'string', description: 'Organization identifier' },
  actor: { type: 'string', description: 'User who triggered the event' },
  timestamp: { type: 'string', description: 'ISO 8601 event timestamp' },
  data: { type: 'json', description: 'Full event payload as JSON' },
} as const

/**
 * Shared KB article output schema used across knowledge base triggers
 */
export const kbOutputs = {
  event: { type: 'string', description: 'The Enduria event type' },
  articleId: { type: 'string', description: 'Unique article identifier' },
  title: { type: 'string', description: 'Article title' },
  category: { type: 'string', description: 'Article category' },
  status: { type: 'string', description: 'Article publication status' },
  visibility: { type: 'string', description: 'Article visibility (public, internal, private)' },
  orgId: { type: 'string', description: 'Organization identifier' },
  actor: { type: 'string', description: 'User who triggered the event' },
  timestamp: { type: 'string', description: 'ISO 8601 event timestamp' },
  data: { type: 'json', description: 'Full event payload as JSON' },
} as const

/**
 * Generic ops output schema for project, SLA, and client triggers
 */
export const opsOutputs = {
  event: { type: 'string', description: 'The Enduria event type' },
  entityId: { type: 'string', description: 'Identifier of the affected entity' },
  entityType: { type: 'string', description: 'Type of entity (project, sla, client)' },
  orgId: { type: 'string', description: 'Organization identifier' },
  actor: { type: 'string', description: 'User who triggered the event' },
  timestamp: { type: 'string', description: 'ISO 8601 event timestamp' },
  data: { type: 'json', description: 'Full event payload as JSON' },
} as const

/**
 * Catch-all webhook output schema
 */
export const webhookOutputs = {
  event: { type: 'string', description: 'The Enduria event type' },
  orgId: { type: 'string', description: 'Organization identifier' },
  entityId: { type: 'string', description: 'Identifier of the affected entity' },
  entityType: { type: 'string', description: 'Type of entity' },
  data: { type: 'json', description: 'Full event payload as JSON' },
  actor: { type: 'string', description: 'User who triggered the event' },
  timestamp: { type: 'string', description: 'ISO 8601 event timestamp' },
} as const
