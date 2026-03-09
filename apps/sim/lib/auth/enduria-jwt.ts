import jwt from 'jsonwebtoken'
import { jwtDecrypt } from 'jose'
import type { EnduriaUser } from './enduria-types'

/**
 * Derive the encryption key that NextAuth v4 uses for JWE tokens.
 * Uses HKDF (SHA-256) to produce a 32-byte key for A256GCM decryption.
 */
async function getDerivedEncryptionKey(secret: string): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HKDF' },
    false,
    ['deriveBits']
  )
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0),
      info: encoder.encode('NextAuth.js Generated Encryption Key'),
    },
    keyMaterial,
    256 // 32 bytes for A256GCM
  )
  return new Uint8Array(derivedBits)
}

let _encryptionKeyPromise: Promise<Uint8Array> | null = null

function getEncryptionKey(secret: string): Promise<Uint8Array> {
  if (!_encryptionKeyPromise) {
    _encryptionKeyPromise = getDerivedEncryptionKey(secret)
  }
  return _encryptionKeyPromise
}

function extractUser(decoded: Record<string, unknown>): EnduriaUser | null {
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
}

/**
 * Validate an Enduria NextAuth JWT token.
 *
 * Tries JWE decryption first (NextAuth v4 session cookies are encrypted),
 * then falls back to JWS verification (service-to-service Bearer tokens).
 */
export async function validateEnduriaJWT(
  token: string | undefined
): Promise<EnduriaUser | null> {
  if (!token) return null

  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    console.error('[Auth] NEXTAUTH_SECRET not configured')
    return null
  }

  // Try 1: Decrypt as NextAuth JWE token (browser session cookies)
  try {
    const encryptionKey = await getEncryptionKey(secret)
    const { payload } = await jwtDecrypt(token, encryptionKey, {
      clockTolerance: 15,
    })
    return extractUser(payload as Record<string, unknown>)
  } catch {
    // Not a JWE token — fall through to JWS verification
  }

  // Try 2: Verify as plain signed JWT (service-to-service Bearer tokens)
  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    }) as Record<string, unknown>
    return extractUser(decoded)
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
    return await validateEnduriaJWT(token)
  }

  // Try Authorization header (for service-to-service)
  const headerStore = await headers()
  const authHeader = headerStore.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return await validateEnduriaJWT(authHeader.slice(7))
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
