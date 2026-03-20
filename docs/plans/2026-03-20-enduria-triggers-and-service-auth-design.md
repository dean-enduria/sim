# Enduria Trigger System + Service-to-Service Auth — Design Spec

**Date:** 2026-03-20
**Status:** Approved

## Overview

Enable end-to-end ITSM workflow automation by: (1) creating grouped Enduria event triggers so workflows can start from ITSM events, and (2) implementing service-to-service auth so SIM tools can call Enduria APIs without a browser session.

## Part 1: Service-to-Service Auth

### Problem

SIM tools send `x-internal-api-secret` + `x-org-id` headers when calling Enduria APIs. Enduria only accepts NextAuth session cookies. All SIM tool calls get 401 in production.

### Design

Create a `getSessionOrServiceAuth()` helper in Enduria that wraps `getSession()` with a fallback to service auth:

1. Try `getSession()` first — if valid session, return it (existing behavior)
2. If no session, check for `x-internal-api-secret` header
3. Use `crypto.timingSafeEqual` to compare against `process.env.INTERNAL_API_SECRET`
4. If match, read `x-org-id` header and validate the org exists in the database
5. Construct a synthetic session with scoped permissions (not full admin)
6. Log the service auth event for audit trail

### Security Hardening

- **Timing-safe comparison** — `crypto.timingSafeEqual` for secret comparison
- **Org validation** — verify `x-org-id` references a real org in the database
- **Scoped permissions** — synthetic session gets a fixed permission set covering only what SIM tools need: `tickets.view.all`, `tickets.create`, `tickets.createIncident`, `tickets.createChange`, `tickets.createProblem`, `tickets.createServiceRequest`, `assets.view`, `assets.manage`, `kb.view`, `users.view`
- **Reject dual-auth** — if request has both a valid session cookie AND the secret header, use the session (ignore the header). Prevents confused deputy.
- **Audit logging** — every service-auth request logged with orgId, endpoint, and timestamp

### Files

- Create: `src/lib/middleware/service-auth.ts` — the `getSessionOrServiceAuth()` helper
- Modify: API routes that SIM tools call to use `getSessionOrServiceAuth()` instead of `getSession()`:
  - `src/app/api/unified-tickets/route.ts` (GET, POST)
  - `src/app/api/unified-tickets/[id]/route.ts` (GET, PUT, DELETE)
  - `src/app/api/unified-tickets/[id]/comments/route.ts` (POST)
  - `src/app/api/assets/route.ts` (GET)
  - `src/app/api/assets/[id]/route.ts` (GET, PATCH)
  - `src/app/api/knowledge-base/search/route.ts` (GET)
  - `src/app/api/knowledge-base/[id]/route.ts` (GET)
  - `src/app/api/users/route.ts` (GET)
  - `src/app/api/users/[id]/route.ts` (GET)

### Synthetic Session Shape

```typescript
{
  id: 'service:sim',
  orgId: '<from x-org-id header>',
  email: 'sim-service@internal',
  name: 'SIM Workflow Engine',
  role: 'service',
  permissions: [
    'tickets.view.all', 'tickets.create', 'tickets.createIncident',
    'tickets.createChange', 'tickets.createProblem', 'tickets.createServiceRequest',
    'assets.view.all', 'assets.manage',
    'kb.view',
    'users.view.all',
  ],
  isServiceAuth: true,
}
```

## Part 2: Enduria Trigger System

### Problem

SIM has 21 Enduria tools (actions) but no triggers. IT admins can't create workflows that start from ITSM events. The webhook receiver (`/api/webhooks/enduria`) is a stub that logs events but doesn't execute workflows.

### Design

6 grouped triggers covering all 46 Enduria event types, following SIM's existing trigger patterns (Slack, GitHub).

### Trigger Definitions

| Trigger ID | Name | Provider | Events |
|---|---|---|---|
| `enduria_ticket_events` | Ticket Events | `enduria` | ticket.created, ticket.updated, ticket.assigned, ticket.escalated, ticket.resolved, ticket.reopened, ticket.commented, ticket.priority_changed, ticket.status_changed |
| `enduria_incident_events` | Incident Events | `enduria` | incident.created, incident.triggered, incident.updated, incident.escalated, incident.resolved, incident.acknowledged |
| `enduria_change_events` | Change Request Events | `enduria` | change.created, change.submitted, change.approved, change.rejected, change.implemented, change.closed |
| `enduria_asset_events` | Asset Events | `enduria` | asset.created, asset.updated, asset.discovered, asset.retired, asset.maintenance_due |
| `enduria_kb_events` | Knowledge Base Events | `enduria` | kb.article.published, kb.article.updated, kb.article.archived, kb.article.deleted |
| `enduria_ops_events` | Operations Events | `enduria` | project.created, project.task.completed, project.task.overdue, project.milestone.reached, sla.breached, sla.warning, client.created, client.updated |

### Trigger SubBlocks (UI)

Each trigger shows:
1. **Event type multi-select** — which events within this group to listen for
2. **Webhook URL** — read-only display (auto-configured, no manual setup needed)
3. **Info text** — "Events are automatically sent from Enduria. No configuration required."

### Trigger Outputs

Every trigger provides these outputs to the workflow:

```typescript
outputs: {
  event: { type: 'string', description: 'Event type (e.g., ticket.created)' },
  orgId: { type: 'string', description: 'Organization ID' },
  entityId: { type: 'string', description: 'ID of the affected entity' },
  entityType: { type: 'string', description: 'Entity type (ticket, incident, change, asset, etc.)' },
  data: { type: 'json', description: 'Full event payload' },
  actor: { type: 'string', description: 'User ID or "system"' },
  timestamp: { type: 'string', description: 'ISO 8601 timestamp' },
}
```

### Block Update

Set `triggerAllowed: true` on `EnduriaBlock` in `blocks/blocks/enduria.ts` so the block appears in the trigger palette.

### Webhook Receiver Implementation

Replace the stub in `app/api/webhooks/enduria/route.ts`:

1. Validate `x-internal-api-secret` header (existing)
2. Parse event payload (existing)
3. **NEW:** Query deployed workflows in this org that have an Enduria trigger matching the event type
4. **NEW:** For each matching workflow, queue execution via SIM's async job system (`queueWebhookExecution` or equivalent)
5. Return `{ received: true, workflowsTriggered: N }`

The receiver needs to:
- Query the `workflow` and `webhook` tables for deployed workflows with Enduria triggers
- Match the incoming event type against the trigger's configured event filter
- Map `orgId` to `workspaceId` (1:1 in our model)
- Use SIM's existing execution queue (Redis/BullMQ or database fallback)

### Files (SIM)

- Create: `triggers/enduria/ticket-events.ts`
- Create: `triggers/enduria/incident-events.ts`
- Create: `triggers/enduria/change-events.ts`
- Create: `triggers/enduria/asset-events.ts`
- Create: `triggers/enduria/kb-events.ts`
- Create: `triggers/enduria/ops-events.ts`
- Create: `triggers/enduria/index.ts`
- Modify: `triggers/registry.ts` — register 6 triggers
- Modify: `blocks/blocks/enduria.ts` — set `triggerAllowed: true`
- Modify: `app/api/webhooks/enduria/route.ts` — implement workflow lookup + execution

## End-to-End Flow

```
Enduria event (e.g., incident created)
  │
  ▼
SIMWebhookService.incidentCreated()
  │ POST /sim/api/webhooks/enduria
  │ Headers: x-internal-api-secret, Content-Type: application/json
  │ Body: { event, orgId, entityId, entityType, data, actor, timestamp }
  │
  ▼
SIM Webhook Receiver
  │ Validates secret
  │ Queries deployed workflows with matching Enduria trigger + event type
  │ Queues N workflow executions
  │
  ▼
SIM Workflow Executor
  │ Runs workflow blocks sequentially
  │ Enduria action blocks call Enduria API with x-internal-api-secret
  │
  ▼
Enduria API
  │ getSessionOrServiceAuth() accepts secret header
  │ Constructs scoped synthetic session
  │ Executes the API operation (update ticket, assign, etc.)
  │
  ▼
Done — ITSM data updated, workflow logged
```

## Out of Scope

- Webhook event coverage expansion (emitting the ~35 missing event types from Enduria code) — separate task
- Per-workflow credential management — SIM tools use environment-level secrets, not per-workflow credentials
- Retry logic for failed webhook deliveries — Enduria uses fire-and-forget pattern
- Workflow templates for common ITSM automations — future enhancement
