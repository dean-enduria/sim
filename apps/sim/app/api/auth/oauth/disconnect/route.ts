import { db } from '@sim/db'
import { account } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const logger = createLogger('OAuthDisconnectAPI')

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { provider, providerId, accountId } = body

    const targetProviderId = providerId || provider
    if (!targetProviderId) {
      return NextResponse.json({ error: 'provider or providerId is required' }, { status: 400 })
    }

    const conditions = [eq(account.userId, session.user.id)]

    if (accountId) {
      // Disconnect a specific account
      conditions.push(eq(account.id, accountId))
    } else {
      // Disconnect all accounts for this provider
      conditions.push(eq(account.providerId, targetProviderId))
    }

    const deleted = await db
      .delete(account)
      .where(and(...conditions))
      .returning({ id: account.id })

    return NextResponse.json({
      success: true,
      disconnected: deleted.length,
    })
  } catch (error) {
    logger.error('Failed to disconnect OAuth account', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
