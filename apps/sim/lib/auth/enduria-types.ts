export interface EnduriaUser {
  userId: string
  email: string
  orgId: string
  role: string
  roleId?: string
  firstName?: string
  lastName?: string
  name?: string
  permissions?: string[]
}
