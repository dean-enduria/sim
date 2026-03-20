import crypto from 'crypto'
import { createLogger } from '@sim/logger'
import { db, webhook, workflow, workspace, workflowDeploymentVersion } from '@sim/db'
import { and, eq, isNull, or } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { generateRequestId } from '@/lib/core/utils/request'
import {
  checkWebhookPreprocessing,
  formatProviderErrorResponse,
  handlePreDeploymentVerification,
  queueWebhookExecution,
  shouldSkipWebhookEvent,
} from '@/lib/webhooks/processor'
import { blockExistsInDeployment } from '@/lib/workflows/persistence/utils'

const logger = createLogger('EnduriaWebhookReceiver')

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Timing-safe comparison of two strings.
 * Returns false if either value is missing or lengths differ.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()

  // --- 1. Validate internal API secret (timing-safe) ---
  const secret = request.headers.get('x-internal-api-secret')
  const expectedSecret = process.env.INTERNAL_API_SECRET

  if (!expectedSecret || !secret || !timingSafeEqual(secret, expectedSecret)) {
    logger.warn(`[${requestId}] Enduria webhook auth failed`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // --- 2. Parse event payload ---
  let payload: { event: string; orgId: string; data: Record<string, unknown>; timestamp: string }
  try {
    payload = await request.json()
  } catch (_e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!payload.event || !payload.orgId) {
    return NextResponse.json(
      { error: 'Missing required fields: event, orgId' },
      { status: 400 }
    )
  }

  logger.info(`[${requestId}] Enduria webhook: ${payload.event} for org ${payload.orgId}`)

  // --- 3. Look up workspace by orgId ---
  const [ws] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(eq(workspace.orgId, payload.orgId))
    .limit(1)

  if (!ws) {
    logger.warn(`[${requestId}] No workspace found for orgId: ${payload.orgId}`)
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  // --- 4. Find all active Enduria webhooks for workflows in this workspace ---
  const webhooksForWorkspace = await db
    .select({
      webhook: webhook,
      workflow: workflow,
    })
    .from(webhook)
    .innerJoin(workflow, eq(webhook.workflowId, workflow.id))
    .leftJoin(
      workflowDeploymentVersion,
      and(
        eq(workflowDeploymentVersion.workflowId, workflow.id),
        eq(workflowDeploymentVersion.isActive, true)
      )
    )
    .where(
      and(
        eq(webhook.provider, 'enduria'),
        eq(webhook.isActive, true),
        eq(workflow.workspaceId, ws.id),
        or(
          eq(webhook.deploymentVersionId, workflowDeploymentVersion.id),
          and(isNull(workflowDeploymentVersion.id), isNull(webhook.deploymentVersionId))
        )
      )
    )

  if (webhooksForWorkspace.length === 0) {
    logger.debug(
      `[${requestId}] No active Enduria webhooks for workspace ${ws.id} (org ${payload.orgId})`
    )
    return NextResponse.json({ received: true, webhooksProcessed: 0 })
  }

  logger.info(
    `[${requestId}] Found ${webhooksForWorkspace.length} Enduria webhook(s) for workspace ${ws.id}`
  )

  // --- 5. Fan-out: process each webhook through the standard pipeline ---
  const body = payload // The full payload becomes the webhook body
  const responses: NextResponse[] = []

  for (const { webhook: foundWebhook, workflow: foundWorkflow } of webhooksForWorkspace) {
    // Auth already validated above — verifyProviderAuth will short-circuit for enduria

    // Preprocessing (rate limits, deployment checks, billing)
    let preprocessError: NextResponse | null = null
    try {
      preprocessError = await checkWebhookPreprocessing(foundWorkflow, foundWebhook, requestId)
      if (preprocessError) {
        if (webhooksForWorkspace.length > 1) {
          logger.warn(
            `[${requestId}] Preprocessing failed for webhook ${foundWebhook.id}, continuing to next`
          )
          continue
        }
        return preprocessError
      }
    } catch (error) {
      logger.error(`[${requestId}] Unexpected error during webhook preprocessing`, {
        error: error instanceof Error ? error.message : String(error),
        webhookId: foundWebhook.id,
        workflowId: foundWorkflow.id,
      })

      if (webhooksForWorkspace.length > 1) {
        continue
      }

      return formatProviderErrorResponse(
        foundWebhook,
        'An unexpected error occurred during preprocessing',
        500
      )
    }

    // Check block exists in deployment
    if (foundWebhook.blockId) {
      const blockExists = await blockExistsInDeployment(foundWorkflow.id, foundWebhook.blockId)
      if (!blockExists) {
        const preDeploymentResponse = handlePreDeploymentVerification(foundWebhook, requestId)
        if (preDeploymentResponse) {
          return preDeploymentResponse
        }

        logger.info(
          `[${requestId}] Trigger block ${foundWebhook.blockId} not found in deployment for workflow ${foundWorkflow.id}`
        )
        if (webhooksForWorkspace.length > 1) {
          continue
        }
        return new NextResponse('Trigger block not found in deployment', { status: 404 })
      }
    }

    // Provider-specific event skip check
    if (shouldSkipWebhookEvent(foundWebhook, body, requestId)) {
      continue
    }

    // Queue execution through the standard pipeline
    // queueWebhookExecution handles Enduria event filtering internally
    const response = await queueWebhookExecution(foundWebhook, foundWorkflow, body, request, {
      requestId,
      path: foundWebhook.path,
    })
    responses.push(response)
  }

  if (responses.length === 0) {
    // All webhooks were filtered out or failed — still return 200 to avoid retries
    return NextResponse.json({ received: true, webhooksProcessed: 0 })
  }

  if (responses.length === 1) {
    return responses[0]
  }

  logger.info(
    `[${requestId}] Processed ${responses.length} Enduria webhooks for org ${payload.orgId}`
  )
  return NextResponse.json({
    received: true,
    webhooksProcessed: responses.length,
  })
}
