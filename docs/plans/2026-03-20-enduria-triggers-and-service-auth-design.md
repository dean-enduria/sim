# Enduria Trigger System + Service-to-Service Auth — Design Spec

**Date:** 2026-03-20
**Status:** Approved

## Overview

Enable end-to-end ITSM workflow automation by: (1) creating per-event Enduria triggers so workflows can start from ITSM events, and (2) implementing service-to-service auth so SIM tools can call Enduria APIs without a browser session.

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
- **Scoped permissions** — synthetic session gets a fixed permission set covering only what SIM tools need: `tickets.view.all`, `tickets.create`, `tickets.createIncident`, `tickets.createChange`, `tickets.createProblem`, `tickets.createServiceRequest`, `assets.view.all`, `assets.manage`, `kb.view`, `users.view.all`
- **Reject dual-auth** — if request has both a valid session cookie AND the secret header, use the session (ignore the header). Prevents confused deputy.
- **Audit logging** — every service-auth request logged with orgId, endpoint, and timestamp

### Files (Enduria)

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

Per-event triggers following the GitHub pattern (one trigger per event type), plus a catch-all `enduria_webhook` trigger. All use SIM's standard webhook pipeline (`webhook` table + `processor.ts`) — no custom receiver logic.

### Trigger Architecture

Enduria triggers use SIM's standard webhook infrastructure:

1. When a workflow with an Enduria trigger is **deployed**, SIM creates a `webhook` record with `provider: 'enduria'` and a unique `path`
2. The Enduria webhook receiver at `/api/webhooks/enduria` fans out incoming events to the standard `/api/webhooks/trigger/[path]` flow
3. SIM's existing `processor.ts` handles auth verification, event filtering, deployment checks, and execution queueing
4. An `enduria` case is added to `verifyProviderAuth()` in the processor to validate `x-internal-api-secret`

This means Enduria triggers get all existing infrastructure for free: rate limiting, billing checks, deployment verification, execution logging.

### Webhook Receiver Changes

The `/api/webhooks/enduria/route.ts` receiver becomes a **fan-out adapter**:

1. Validate `x-internal-api-secret` using `crypto.timingSafeEqual` (fix existing timing-unsafe comparison)
2. Parse event payload
3. Look up all webhook records with `provider: 'enduria'` in the org's workspace
4. For each matching webhook, forward the event to the standard webhook processing pipeline
5. Return `{ received: true, workflowsTriggered: N }`

### orgId to workspaceId Mapping

Enduria's `orgId` maps 1:1 to SIM's `workspaceId`. The mapping is established during auto-provisioning (when a user first accesses SIM, a workspace is created with the orgId stored in the workspace record). The webhook receiver queries the `workspace` table to resolve `orgId` → `workspaceId`.

### Trigger Definitions (36 event types + 1 catch-all)

Following the GitHub pattern, each event type gets its own trigger. Triggers are grouped by file for organization.

**Catch-all:**

| Trigger ID | Name | File |
|---|---|---|
| `enduria_webhook` | Enduria Webhook (All Events) | `triggers/enduria/webhook.ts` |

**Ticket triggers** (`triggers/enduria/ticket-events.ts`):

| Trigger ID | Name |
|---|---|
| `enduria_ticket_created` | Ticket Created |
| `enduria_ticket_updated` | Ticket Updated |
| `enduria_ticket_assigned` | Ticket Assigned |
| `enduria_ticket_escalated` | Ticket Escalated |
| `enduria_ticket_resolved` | Ticket Resolved |
| `enduria_ticket_reopened` | Ticket Reopened |
| `enduria_ticket_commented` | Ticket Commented |
| `enduria_ticket_priority_changed` | Ticket Priority Changed |
| `enduria_ticket_status_changed` | Ticket Status Changed |

**Incident triggers** (`triggers/enduria/incident-events.ts`):

| Trigger ID | Name |
|---|---|
| `enduria_incident_created` | Incident Created |
| `enduria_incident_triggered` | Incident Triggered |
| `enduria_incident_updated` | Incident Updated |
| `enduria_incident_escalated` | Incident Escalated |
| `enduria_incident_resolved` | Incident Resolved |
| `enduria_incident_acknowledged` | Incident Acknowledged |

**Change triggers** (`triggers/enduria/change-events.ts`):

| Trigger ID | Name |
|---|---|
| `enduria_change_created` | Change Created |
| `enduria_change_submitted` | Change Submitted |
| `enduria_change_approved` | Change Approved |
| `enduria_change_rejected` | Change Rejected |
| `enduria_change_implemented` | Change Implemented |
| `enduria_change_closed` | Change Closed |

**Asset triggers** (`triggers/enduria/asset-events.ts`):

| Trigger ID | Name |
|---|---|
| `enduria_asset_created` | Asset Created |
| `enduria_asset_updated` | Asset Updated |
| `enduria_asset_discovered` | Asset Discovered |
| `enduria_asset_retired` | Asset Retired |
| `enduria_asset_maintenance_due` | Asset Maintenance Due |

**KB triggers** (`triggers/enduria/kb-events.ts`):

| Trigger ID | Name |
|---|---|
| `enduria_kb_article_published` | Article Published |
| `enduria_kb_article_updated` | Article Updated |
| `enduria_kb_article_archived` | Article Archived |
| `enduria_kb_article_deleted` | Article Deleted |

**Ops triggers** (`triggers/enduria/ops-events.ts`):

| Trigger ID | Name |
|---|---|
| `enduria_project_created` | Project Created |
| `enduria_project_task_completed` | Task Completed |
| `enduria_project_task_overdue` | Task Overdue |
| `enduria_project_milestone_reached` | Milestone Reached |
| `enduria_sla_breached` | SLA Breached |
| `enduria_sla_warning` | SLA Warning |
| `enduria_client_created` | Client Created |
| `enduria_client_updated` | Client Updated |

### Trigger Outputs (Entity-Specific)

Each trigger group defines structured outputs matching Enduria's data model, plus a generic `data` fallback.

**Ticket trigger outputs:**
```typescript
outputs: {
  event: { type: 'string' },
  ticketId: { type: 'string' },
  ticketNumber: { type: 'string' },
  title: { type: 'string' },
  status: { type: 'string' },
  priority: { type: 'string' },
  assignedTo: { type: 'string' },
  requesterId: { type: 'string' },
  category: { type: 'string' },
  ticketType: { type: 'string' },
  orgId: { type: 'string' },
  actor: { type: 'string' },
  timestamp: { type: 'string' },
  data: { type: 'json', description: 'Full event payload' },
}
```

**Incident trigger outputs:** Same as ticket plus `severity`, `impact`, `urgency`, `affectedServices`.

**Change trigger outputs:** Same as ticket plus `risk`, `changeType`, `backoutPlan`, `plannedStartDate`, `plannedEndDate`.

**Asset trigger outputs:** `assetId`, `name`, `category`, `status`, `manufacturer`, `model`, `serialNumber`, `location`, `assignedTo`, plus generic fields.

**KB trigger outputs:** `articleId`, `title`, `category`, `status`, `visibility`, plus generic fields.

**Ops trigger outputs:** Varies by event — project/task/milestone fields for project events, ticket fields for SLA events, client fields for client events.

**Catch-all (`enduria_webhook`) outputs:** Generic: `event`, `orgId`, `entityId`, `entityType`, `data`, `actor`, `timestamp`.

### Trigger SubBlocks (UI)

Each trigger shows:
1. **Webhook URL** — read-only display (auto-generated unique path)
2. **Info text** — "Events are automatically sent from Enduria when this workflow is deployed. No configuration required."
3. **Trigger save button** — standard save mechanism

### Block Update

Set `triggerAllowed: true` on `EnduriaBlock` in `blocks/blocks/enduria.ts`.

### Files (SIM)

- Create: `triggers/enduria/webhook.ts` — catch-all trigger
- Create: `triggers/enduria/ticket-events.ts` — 9 ticket triggers
- Create: `triggers/enduria/incident-events.ts` — 6 incident triggers
- Create: `triggers/enduria/change-events.ts` — 6 change triggers
- Create: `triggers/enduria/asset-events.ts` — 5 asset triggers
- Create: `triggers/enduria/kb-events.ts` — 4 KB triggers
- Create: `triggers/enduria/ops-events.ts` — 8 ops triggers
- Create: `triggers/enduria/index.ts` — barrel export
- Modify: `triggers/registry.ts` — register 37 triggers
- Modify: `blocks/blocks/enduria.ts` — set `triggerAllowed: true`
- Modify: `app/api/webhooks/enduria/route.ts` — fan-out to standard pipeline
- Modify: `lib/webhooks/processor.ts` — add `enduria` case to `verifyProviderAuth()`

### Prerequisite Fix

Fix `SIMWebhookService.sendEvent()` in Enduria at `src/lib/services/sim-webhook.ts:98` — `entityType` is hardcoded to `'event'` instead of being inferred from the event type. This needs to pass the actual entity type for structured trigger outputs to work.

## End-to-End Flow

```
Enduria event (e.g., incident created)
  │
  ▼
SIMWebhookService.incidentCreated()
  │ POST /sim/api/webhooks/enduria
  │ Headers: x-internal-api-secret
  │ Body: { event, orgId, entityId, entityType, data, actor, timestamp }
  │
  ▼
SIM Webhook Receiver (/api/webhooks/enduria)
  │ Validates secret (timing-safe)
  │ Resolves orgId → workspaceId
  │ Finds webhook records with provider: 'enduria'
  │ Fans out to standard webhook processing pipeline
  │
  ▼
SIM Webhook Processor (processor.ts)
  │ Verifies provider auth (enduria case)
  │ Matches event type against trigger's configured event
  │ Runs preprocessing (rate limits, deployment checks)
  │ Queues workflow execution
  │
  ▼
SIM Workflow Executor
  │ Runs workflow blocks with trigger outputs as input
  │ Enduria action blocks call Enduria API with x-internal-api-secret
  │
  ▼
Enduria API
  │ getSessionOrServiceAuth() accepts secret header
  │ Constructs scoped synthetic session
  │ Executes the API operation
  │
  ▼
Done — ITSM data updated, workflow logged
```

## Out of Scope

- Webhook event coverage expansion (emitting the ~25 missing event types from Enduria code) — separate task
- Per-workflow credential management — SIM tools use environment-level secrets
- Retry logic for failed webhook deliveries — Enduria uses fire-and-forget
- Workflow templates for common ITSM automations — future enhancement
- Event deduplication — can be added later using entityId + event + timestamp as idempotency key
