/**
 * Get the current request context from middleware-injected headers.
 * Use this in API route handlers after middleware has validated the JWT.
 *
 * The Enduria proxy sets these headers on every authenticated request:
 * - x-enduria-org-id: The organization ID (maps 1:1 to SIM's workspaceId)
 * - x-enduria-user-id: The authenticated user's ID
 * - x-enduria-role: The user's role (e.g., 'admin', 'user')
 * - x-enduria-email: The user's email address
 */
export async function getRequestContext(): Promise<{
  orgId: string
  userId: string
  role: string
  email: string
  /** orgId mapped as workspaceId for compatibility with SIM's data model */
  workspaceId: string
} | null> {
  const { headers } = await import('next/headers')
  const headerStore = await headers()
  const orgId = headerStore.get('x-enduria-org-id')
  const userId = headerStore.get('x-enduria-user-id')
  const role = headerStore.get('x-enduria-role') || ''
  const email = headerStore.get('x-enduria-email') || ''

  if (!orgId || !userId) return null

  return { orgId, userId, role, email, workspaceId: orgId }
}

/**
 * Require request context. Throws if not authenticated.
 */
export async function requireRequestContext() {
  const ctx = await getRequestContext()
  if (!ctx) throw new Error('Unauthorized')
  return ctx
}
