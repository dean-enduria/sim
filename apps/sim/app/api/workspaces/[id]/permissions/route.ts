import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUsersWithPermissions, verifyWorkspaceOrg, getWorkspaceWithOwner } from '@/lib/workspaces/permissions/utils'
import { db } from '@sim/db'
import { user } from '@sim/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: workspaceId } = await params

    const orgCheck = await verifyWorkspaceOrg(workspaceId)
    if (!orgCheck.ok) {
      return NextResponse.json({ error: orgCheck.error }, { status: orgCheck.status })
    }

    const usersWithPermissions = await getUsersWithPermissions(workspaceId)

    // Also include workspace owner if not already in permissions list
    const ws = await getWorkspaceWithOwner(workspaceId)
    if (ws) {
      const ownerInList = usersWithPermissions.some((u) => u.userId === ws.ownerId)
      if (!ownerInList) {
        const [ownerUser] = await db
          .select({ id: user.id, email: user.email, name: user.name })
          .from(user)
          .where(eq(user.id, ws.ownerId))
          .limit(1)

        if (ownerUser) {
          usersWithPermissions.unshift({
            userId: ownerUser.id,
            email: ownerUser.email,
            name: ownerUser.name,
            permissionType: 'admin',
          })
        }
      }
    }

    return NextResponse.json({
      users: usersWithPermissions,
      total: usersWithPermissions.length,
    })
  } catch (error) {
    console.error('[/api/workspaces/[id]/permissions] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
