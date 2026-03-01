import { describe, it, expect, vi } from 'vitest'
import { validateInternalApiSecret } from '../internal-api'

describe('validateInternalApiSecret', () => {
  it('returns true for valid secret', () => {
    vi.stubEnv('INTERNAL_API_SECRET', 'test-secret-value')
    expect(validateInternalApiSecret('test-secret-value')).toBe(true)
  })

  it('returns false for invalid secret', () => {
    vi.stubEnv('INTERNAL_API_SECRET', 'test-secret-value')
    expect(validateInternalApiSecret('wrong-secret')).toBe(false)
  })

  it('returns false for missing provided secret', () => {
    vi.stubEnv('INTERNAL_API_SECRET', 'test-secret-value')
    expect(validateInternalApiSecret(undefined)).toBe(false)
    expect(validateInternalApiSecret(null)).toBe(false)
  })

  it('returns false when env secret is not configured', () => {
    vi.stubEnv('INTERNAL_API_SECRET', '')
    expect(validateInternalApiSecret('any-value')).toBe(false)
  })
})
