import { NextRequest, NextResponse } from 'next/server'

interface EnduriaWebhookPayload {
  event: string
  orgId: string
  data: Record<string, unknown>
  timestamp: string
}

export async function POST(request: NextRequest) {
  // Validate internal API secret
  const secret = request.headers.get('x-internal-api-secret')
  const expectedSecret = process.env.INTERNAL_API_SECRET

  if (!expectedSecret || !secret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: EnduriaWebhookPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!payload.event || !payload.orgId) {
    return NextResponse.json(
      { error: 'Missing required fields: event, orgId' },
      { status: 400 }
    )
  }

  console.log(`[Webhook] Received ${payload.event} for org ${payload.orgId}`)

  // TODO: In future phases, look up workflows triggered by this event type
  // and queue them for execution via Trigger.dev or the async job system.
  // For now, just acknowledge receipt.

  return NextResponse.json({
    received: true,
    event: payload.event,
    orgId: payload.orgId,
  })
}
