/**
 * Auth client module – Enduria stubs.
 *
 * Better Auth's createAuthClient has been removed. All hooks and methods are
 * stubbed so that existing import sites continue to compile. Session data is
 * provided by the SessionProvider which fetches from /api/session (Enduria JWT).
 */

'use client'

import { useContext } from 'react'
import { SessionContext, type SessionHookResult } from '@/app/_shell/providers/session-provider'

// ---------------------------------------------------------------------------
// Stub client – provides the shape expected by consumers
// ---------------------------------------------------------------------------

export const client = {
  getSession: async (_opts?: Record<string, unknown>) => {
    // Client-side session fetch – delegate to the /api/session endpoint
    try {
      const res = await fetch('/api/session')
      if (!res.ok) return { data: null }
      const data = await res.json()
      return { data }
    } catch {
      return { data: null }
    }
  },
  oauth2: {
    link: async (_opts: { providerId: string; callbackURL?: string }) => {
      console.warn('[auth-client] oauth2.link called – Better Auth removed; no-op')
    },
  },
  subscription: {
    list: async (..._args: unknown[]) => ({ data: [] }),
    upgrade: async (..._args: unknown[]) => ({ data: null }),
    cancel: async (..._args: unknown[]) => ({ data: null }),
    restore: async (..._args: unknown[]) => ({ data: null }),
  },
  organization: {
    list: async (..._args: unknown[]) => ({ data: [] }),
    getFullOrganization: async (..._args: unknown[]) => ({ data: null }),
    setActive: async (..._args: unknown[]) => ({ data: null }),
    create: async (..._args: unknown[]) => ({ data: null }),
  },
  useActiveOrganization: () => ({ data: undefined, isPending: false, error: null }),
} as Record<string, any>

// ---------------------------------------------------------------------------
// useSession – reads from the SessionProvider context
// ---------------------------------------------------------------------------

export function useSession(): SessionHookResult {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error(
      'SessionProvider is not mounted. Wrap your app with <SessionProvider> in app/layout.tsx.'
    )
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Organization / subscription hooks – stubbed
// ---------------------------------------------------------------------------

export const useActiveOrganization = () => ({
  data: undefined,
  isPending: false,
  error: null,
})

export const useSubscription = () => ({
  list: client.subscription.list,
  upgrade: client.subscription.upgrade,
  cancel: client.subscription.cancel,
  restore: client.subscription.restore,
})

// ---------------------------------------------------------------------------
// signIn / signUp / signOut – stubs
// ---------------------------------------------------------------------------

export const signIn = async (..._args: unknown[]) => {
  console.warn('[auth-client] signIn called – Better Auth removed; no-op')
}

export const signUp = async (..._args: unknown[]) => {
  console.warn('[auth-client] signUp called – Better Auth removed; no-op')
}

export const signOut = async (..._args: unknown[]) => {
  console.warn('[auth-client] signOut called – Better Auth removed; no-op')
}
