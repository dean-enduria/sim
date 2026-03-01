import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'sim-orchestration',
    timestamp: new Date().toISOString(),
  })
}
