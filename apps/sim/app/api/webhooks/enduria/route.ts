import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const secret = request.headers.get('x-internal-api-secret')
  return NextResponse.json({ received: true, hasSecret: !!secret, event: body.event })
}
