import { timingSafeEqual } from 'crypto'

/**
 * Validate the internal API secret for service-to-service calls.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function validateInternalApiSecret(
  providedSecret: string | undefined | null
): boolean {
  const expectedSecret = process.env.INTERNAL_API_SECRET
  if (!expectedSecret || !providedSecret) return false

  try {
    const a = Buffer.from(providedSecret)
    const b = Buffer.from(expectedSecret)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
