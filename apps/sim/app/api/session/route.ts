import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

/**
 * GET /api/session
 *
 * Returns the current user session based on the Enduria JWT cookie.
 * Used by the client-side SessionProvider to fetch session data.
 */
export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(null, { status: 401 })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('[/api/session] Error getting session:', error)
    return NextResponse.json(null, { status: 500 })
  }
}
