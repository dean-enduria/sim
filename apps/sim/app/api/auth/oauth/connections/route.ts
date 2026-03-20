import { db } from '@sim/db'
import { account } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const logger = createLogger('OAuthConnectionsAPI')

export async function GET() {
  const session = await getSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const accounts = await db
      .select({
        id: account.id,
        accountId: account.accountId,
        providerId: account.providerId,
        scope: account.scope,
        createdAt: account.createdAt,
      })
      .from(account)
      .where(eq(account.userId, session.user.id))

    // Group accounts by provider
    const providerMap = new Map<
      string,
      {
        provider: string
        accounts: { id: string; name: string }[]
        lastConnected?: string
        scopes?: string[]
      }
    >()

    for (const acc of accounts) {
      // Skip credential-type accounts (e.g. password)
      if (!acc.providerId || acc.providerId === 'credential') continue

      const existing = providerMap.get(acc.providerId)
      if (existing) {
        existing.accounts.push({ id: acc.id, name: acc.accountId })
        if (acc.createdAt && (!existing.lastConnected || acc.createdAt.toISOString() > existing.lastConnected)) {
          existing.lastConnected = acc.createdAt.toISOString()
        }
      } else {
        providerMap.set(acc.providerId, {
          provider: acc.providerId,
          accounts: [{ id: acc.id, name: acc.accountId }],
          lastConnected: acc.createdAt?.toISOString(),
          scopes: acc.scope ? acc.scope.split(/[\s,]+/) : [],
        })
      }
    }

    return NextResponse.json({ connections: Array.from(providerMap.values()) })
  } catch (error) {
    logger.error('Failed to fetch OAuth connections', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
