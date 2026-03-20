import { getEnduriaUser } from './enduria-jwt'

export type SimRole = 'admin' | 'agent' | 'viewer'

const WRITE_ROLES: SimRole[] = ['admin', 'agent']
const ADMIN_ROLES: SimRole[] = ['admin']

/**
 * Map Enduria role string to SIM role.
 * Unknown roles default to 'viewer' (least privilege).
 */
function mapRole(enduriaRole: string): SimRole {
  if (enduriaRole === 'admin') return 'admin'
  if (enduriaRole === 'agent') return 'agent'
  return 'viewer'
}

/**
 * Check if the current user can write (create/edit/delete workflows).
 * Returns the Enduria user if authorized, null otherwise.
 */
export async function requireWriteAccess() {
  const user = await getEnduriaUser()
  if (!user) return null
  const role = mapRole(user.role)
  if (!WRITE_ROLES.includes(role)) return null
  return user
}

/**
 * Check if the current user has admin access.
 */
export async function requireAdminAccess() {
  const user = await getEnduriaUser()
  if (!user) return null
  const role = mapRole(user.role)
  if (!ADMIN_ROLES.includes(role)) return null
  return user
}
