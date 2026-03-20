/**
 * API fetch utility with basePath support.
 *
 * Next.js `basePath` only auto-prefixes next/link, next/router, and static
 * assets. Client-side fetch() calls to /api/* are NOT prefixed.
 *
 * When SIM is served behind Enduria's reverse proxy at /workflows/*, all API calls
 * must go to /workflows/api/* to reach SIM's backend. This utility prepends the
 * basePath so callers can write `apiUrl('/api/session')` and get `/workflows/api/session`.
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath
 *
 * Usage:
 *   import { apiUrl } from '@/lib/api/fetcher'
 *   const res = await fetch(apiUrl('/api/session'))
 *
 * Migration: existing `fetch('/api/...')` calls should be updated to
 * `fetch(apiUrl('/api/...'))` as features are touched.
 */

/**
 * Read the basePath configured for this SIM instance.
 *
 * Client-side: Next.js inlines NEXT_PUBLIC_* env vars at build time, so
 * process.env.NEXT_PUBLIC_SIM_BASE_PATH is available in browser bundles.
 *
 * Server-side: reads SIM_BASE_PATH directly from the runtime environment.
 *
 * Falls back to empty string when running without basePath (standalone SIM).
 */
function getBasePath(): string {
  // NEXT_PUBLIC_ vars are inlined by Next.js at build time — works in both
  // App Router (RSC) and client components, unlike __NEXT_DATA__ which is
  // Pages Router only.
  return process.env.NEXT_PUBLIC_SIM_BASE_PATH ?? process.env.SIM_BASE_PATH ?? ''
}

/**
 * Prepend the Next.js basePath to an API path.
 *
 * @param path - absolute path starting with `/`, e.g. `/api/session`
 * @returns prefixed path, e.g. `/workflows/api/session`
 */
export function apiUrl(path: string): string {
  const base = getBasePath()
  if (!base) return path
  // Avoid double-prefixing if caller already included basePath
  if (path.startsWith(base)) return path
  return `${base}${path}`
}
