import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'
import { validateEnduriaJWT } from '../enduria-jwt'

const TEST_SECRET = 'test-secret-32-characters-long!!'

describe('validateEnduriaJWT', () => {
  beforeEach(() => {
    vi.stubEnv('NEXTAUTH_SECRET', TEST_SECRET)
  })

  it('returns null for missing token', () => {
    expect(validateEnduriaJWT(undefined)).toBeNull()
  })

  it('returns null for invalid token', () => {
    expect(validateEnduriaJWT('invalid-token')).toBeNull()
  })

  it('extracts user from valid Enduria JWT', () => {
    const payload = {
      sub: 'user-123',
      email: 'test@enduria.com',
      orgId: 'org-456',
      role: 'admin',
      firstName: 'Test',
      lastName: 'User',
    }
    const token = jwt.sign(payload, TEST_SECRET, { algorithm: 'HS256' })
    const result = validateEnduriaJWT(token)

    expect(result).toMatchObject({
      userId: 'user-123',
      email: 'test@enduria.com',
      orgId: 'org-456',
      role: 'admin',
      firstName: 'Test',
      lastName: 'User',
    })
  })

  it('returns null for expired token', () => {
    const payload = { sub: 'user-123', orgId: 'org-456' }
    const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '-1h' })
    expect(validateEnduriaJWT(token)).toBeNull()
  })

  it('returns null when orgId is missing', () => {
    const payload = { sub: 'user-123' }
    const token = jwt.sign(payload, TEST_SECRET)
    expect(validateEnduriaJWT(token)).toBeNull()
  })

  it('returns null when secret is not configured', () => {
    vi.stubEnv('NEXTAUTH_SECRET', '')
    const token = jwt.sign({ sub: 'user-123', orgId: 'org-456' }, 'any-secret')
    expect(validateEnduriaJWT(token)).toBeNull()
  })
})
