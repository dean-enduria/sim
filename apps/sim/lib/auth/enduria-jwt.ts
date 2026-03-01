import jwt from 'jsonwebtoken'
import type { EnduriaUser } from './enduria-types'

/**
 * Validate an Enduria NextAuth JWT token.
 * Returns user context or null if invalid.
 */
export function validateEnduriaJWT(
  token: string | undefined
): EnduriaUser | null {
  if (!token) return null

  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    console.error('[Auth] NEXTAUTH_SECRET not configured')
    return null
  }

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    }) as Record<string, unknown>

    const userId = (decoded.sub || decoded.userId) as string
    const orgId = decoded.orgId as string

    if (!userId || !orgId) {
      console.warn('[Auth] JWT missing required claims (sub, orgId)')
      return null
    }

    return {
      userId,
      email: decoded.email as string,
      orgId,
      role: (decoded.role as string) || 'user',
      roleId: decoded.roleId as string | undefined,
      firstName: decoded.firstName as string | undefined,
      lastName: decoded.lastName as string | undefined,
      name: decoded.name as string | undefined,
      permissions: decoded.permissions as string[] | undefined,
    }
  } catch (err) {
    console.warn('[Auth] JWT validation failed:', (err as Error).message)
    return null
  }
}

/**
 * Get current user from request headers/cookies.
 * Works in API route handlers.
 */
export async function getEnduriaUser(): Promise<EnduriaUser | null> {
  const { cookies, headers } = await import('next/headers')

  // Try NextAuth session token cookie
  const cookieStore = await cookies()
  const token =
    cookieStore.get('next-auth.session-token')?.value ||
    cookieStore.get('__Secure-next-auth.session-token')?.value

  if (token) {
    return validateEnduriaJWT(token)
  }

  // Try Authorization header (for service-to-service)
  const headerStore = await headers()
  const authHeader = headerStore.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return validateEnduriaJWT(authHeader.slice(7))
  }

  return null
}

/**
 * Require authenticated user. Throws if not authenticated.
 */
export async function requireEnduriaUser(): Promise<EnduriaUser> {
  const user = await getEnduriaUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
