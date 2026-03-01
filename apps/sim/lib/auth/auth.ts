/**
 * Auth module – Enduria JWT only.
 *
 * Better Auth has been removed. getSession() validates an Enduria JWT from
 * cookies or Authorization header. The `auth` export provides a minimal
 * object so that the few remaining call-sites (e.g. socket middleware)
 * continue to compile; the Better Auth API methods are stubbed.
 */

import { createLogger } from '@sim/logger'
import { headers } from 'next/headers'
import { isAuthDisabled } from '@/lib/core/config/feature-flags'
import { createAnonymousSession, ensureAnonymousUserExists } from './anonymous'

const logger = createLogger('Auth')

// ---------------------------------------------------------------------------
// getSession – the primary export consumed by API routes and hybrid auth
// ---------------------------------------------------------------------------

export async function getSession() {
  if (isAuthDisabled) {
    await ensureAnonymousUserExists()
    return createAnonymousSession()
  }

  // Try Enduria JWT first (cookie-based or Authorization header)
  const { getEnduriaUser } = await import('@/lib/auth/enduria-jwt')
  const enduriaUser = await getEnduriaUser()
  if (enduriaUser) {
    const now = new Date()
    return {
      user: {
        id: enduriaUser.userId,
        name:
          enduriaUser.name ||
          `${enduriaUser.firstName || ''} ${enduriaUser.lastName || ''}`.trim() ||
          enduriaUser.email,
        email: enduriaUser.email,
        emailVerified: true,
        image: null,
        createdAt: now,
        updatedAt: now,
      },
      session: {
        id: `enduria-${enduriaUser.userId}`,
        userId: enduriaUser.userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now,
        token: 'enduria-session',
        ipAddress: null,
        userAgent: null,
      },
    }
  }

  // No valid session found
  logger.warn('No Enduria JWT found in request')
  return null
}

// ---------------------------------------------------------------------------
// Stub `auth` object – keeps socket middleware and other call-sites compiling
// ---------------------------------------------------------------------------

export const auth = {
  api: {
    getSession: async ({ headers: hdrs }: { headers: Headers }) => {
      // Delegate to the module-level getSession(); the headers parameter is
      // ignored because getEnduriaUser reads from next/headers directly.
      return getSession()
    },
    verifyOneTimeToken: async (_body: unknown) => {
      logger.warn('auth.api.verifyOneTimeToken called – Better Auth removed; returning null')
      return null
    },
    signInEmail: async (..._args: unknown[]) => {
      logger.warn('signInEmail called – Better Auth removed; no-op')
      return null
    },
    signUpEmail: async (..._args: unknown[]) => {
      logger.warn('signUpEmail called – Better Auth removed; no-op')
      return null
    },
  },
  handler: async (_req: Request) => {
    return new Response(JSON.stringify({ error: 'Auth handler removed' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  },
}

// ---------------------------------------------------------------------------
// Legacy convenience exports (kept for compatibility)
// ---------------------------------------------------------------------------

export const signIn = auth.api.signInEmail
export const signUp = auth.api.signUpEmail
