import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { NextResponse } from 'next/server'
import { db } from '@sim/db'
import { permissions, user, workspace } from '@sim/db/schema'
import { getEnduriaUser } from '@/lib/auth/enduria-jwt'

/**
 * Ensure a user has an admin permission row for a workspace.
 * Idempotent — skips if a row already exists.
 */
async function ensureOwnerPermission(userId: string, workspaceId: string) {
  const existing = await db.query.permissions.findFirst({
    where: and(
      eq(permissions.userId, userId),
      eq(permissions.entityType, 'workspace'),
      eq(permissions.entityId, workspaceId)
    ),
  })
  if (!existing) {
    const now = new Date()
    await db.insert(permissions).values({
      id: nanoid(),
      userId,
      entityType: 'workspace',
      entityId: workspaceId,
      permissionType: 'admin',
      createdAt: now,
      updatedAt: now,
    })
  }
}

/**
 * Upsert user + workspace for the authenticated Enduria user.
 * Idempotent — safe to call on every request.
 */
async function ensureUserAndWorkspace(enduriaUser: {
  userId: string
  email: string
  orgId: string
  name?: string
  firstName?: string
  lastName?: string
}) {
  const now = new Date()
  const displayName =
    enduriaUser.name ||
    `${enduriaUser.firstName || ''} ${enduriaUser.lastName || ''}`.trim() ||
    enduriaUser.email

  // Upsert user
  const existingUser = await db.query.user.findFirst({
    where: eq(user.id, enduriaUser.userId),
  })

  if (!existingUser) {
    await db.insert(user).values({
      id: enduriaUser.userId,
      name: displayName,
      email: enduriaUser.email,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    })
  }

  // Find existing workspace for this org
  const existingWorkspace = await db.query.workspace.findFirst({
    where: and(
      eq(workspace.orgId, enduriaUser.orgId),
      eq(workspace.ownerId, enduriaUser.userId)
    ),
  })

  if (existingWorkspace) {
    // Backfill: ensure owner has a permission row (may be missing for pre-existing workspaces)
    await ensureOwnerPermission(enduriaUser.userId, existingWorkspace.id)
    return existingWorkspace
  }

  // Check if any workspace exists for this org (from another user)
  const orgWorkspace = await db.query.workspace.findFirst({
    where: eq(workspace.orgId, enduriaUser.orgId),
  })

  if (orgWorkspace) {
    // Ensure this user has at least a permission row for the shared org workspace
    await ensureOwnerPermission(enduriaUser.userId, orgWorkspace.id)
    return orgWorkspace
  }

  // Create new workspace for this org
  const newWorkspace = {
    id: nanoid(),
    name: 'Workflows',
    orgId: enduriaUser.orgId,
    ownerId: enduriaUser.userId,
    billedAccountUserId: enduriaUser.userId,
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(workspace).values(newWorkspace)

  // Insert admin permission row for the owner so getUserEntityPermissions() works
  await db.insert(permissions).values({
    id: nanoid(),
    userId: enduriaUser.userId,
    entityType: 'workspace',
    entityId: newWorkspace.id,
    permissionType: 'admin',
    createdAt: now,
    updatedAt: now,
  })

  return newWorkspace
}

export async function GET() {
  try {
    const enduriaUser = await getEnduriaUser()

    if (!enduriaUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ws = await ensureUserAndWorkspace(enduriaUser)

    // Return as array for compatibility with workspace page expectations
    return NextResponse.json({ workspaces: [ws] })
  } catch (error) {
    console.error('[/api/workspaces] Error:', error)
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    )
  }
}

export async function POST() {
  try {
    const enduriaUser = await getEnduriaUser()

    if (!enduriaUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ws = await ensureUserAndWorkspace(enduriaUser)
    return NextResponse.json({ workspace: ws })
  } catch (error) {
    console.error('[/api/workspaces] Error creating workspace:', error)
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    )
  }
}
