import { db } from '@sim/db'
import { account } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { and, eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const logger = createLogger('OAuthAccountsAPI')

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (!provider) {
      return NextResponse.json({ error: 'provider query parameter is required' }, { status: 400 })
    }

    const accounts = await db
      .select({
        id: account.id,
        accountId: account.accountId,
        providerId: account.providerId,
      })
      .from(account)
      .where(and(eq(account.userId, session.user.id), eq(account.providerId, provider)))

    return NextResponse.json({
      accounts: accounts.map((acc) => ({
        id: acc.id,
        accountId: acc.accountId,
        providerId: acc.providerId,
        displayName: acc.accountId,
      })),
    })
  } catch (error) {
    logger.error('Failed to fetch accounts', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
