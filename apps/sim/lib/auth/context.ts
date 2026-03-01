/**
 * Get the current request context from middleware-injected headers.
 * Use this in API route handlers after middleware has validated the JWT.
 */
export async function getRequestContext(): Promise<{
  orgId: string
  userId: string
  role: string
} | null> {
  const { headers } = await import('next/headers')
  const headerStore = await headers()
  const orgId = headerStore.get('x-enduria-org-id')
  const userId = headerStore.get('x-enduria-user-id')
  const role = headerStore.get('x-enduria-role') || ''

  if (!orgId || !userId) return null

  return { orgId, userId, role }
}

/**
 * Require request context. Throws if not authenticated.
 */
export async function requireRequestContext() {
  const ctx = await getRequestContext()
  if (!ctx) throw new Error('Unauthorized')
  return ctx
}
