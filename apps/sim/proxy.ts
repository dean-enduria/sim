import { createLogger } from '@sim/logger'
import { jwtVerify } from 'jose'
import { type NextRequest, NextResponse } from 'next/server'
import { isAuthDisabled } from './lib/core/config/feature-flags'
import { generateRuntimeCSP } from './lib/core/security/csp'

const logger = createLogger('Proxy')

const SUSPICIOUS_UA_PATTERNS = [
  /^\s*$/, // Empty user agents
  /\.\./, // Path traversal attempt
  /<\s*script/i, // Potential XSS payloads
  /^\(\)\s*{/, // Command execution attempt
  /\b(sqlmap|nikto|gobuster|dirb|nmap)\b/i, // Known scanning tools
] as const

// Paths that don't require authentication
const publicPaths = new Set(['/api/health', '/api/webhooks/enduria'])

const publicPrefixes = [
  '/api/health',
  '/api/webhooks/enduria',
  '/api/webhooks/trigger/',
]

function isPublicPath(pathname: string): boolean {
  if (publicPaths.has(pathname)) return true
  return publicPrefixes.some((p) => pathname.startsWith(p))
}

/**
 * Validate Enduria JWT token using jose (Edge-compatible).
 * Returns decoded payload or null if invalid.
 */
async function validateJWT(token: string): Promise<Record<string, unknown> | null> {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    logger.error('NEXTAUTH_SECRET not configured')
    return null
  }

  try {
    const encodedSecret = new TextEncoder().encode(secret)
    const { payload } = await jwtVerify(token, encodedSecret)
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

/**
 * Extract JWT token from request cookies or Authorization header
 */
function extractToken(request: NextRequest): string | null {
  // Check NextAuth session cookies
  const token =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value

  if (token) return token

  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  return null
}

/**
 * Validate internal API secret for service-to-service calls from Enduria.
 * Returns a response with org context headers if valid, or 401 if invalid secret,
 * or null if this is not an S2S request.
 */
function handleInternalApiAuth(request: NextRequest): NextResponse | null {
  const internalSecret = request.headers.get('x-internal-api-secret')
  if (!internalSecret) return null

  const expected = process.env.INTERNAL_API_SECRET
  if (!expected || internalSecret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orgId = request.headers.get('x-org-id')
  if (!orgId) {
    return NextResponse.json({ error: 'Missing x-org-id header' }, { status: 400 })
  }

  const response = NextResponse.next()
  response.headers.set('x-enduria-org-id', orgId)
  response.headers.set('x-enduria-user-id', 'system')
  response.headers.set('x-enduria-role', 'admin')
  return response
}

/**
 * Handles security filtering for suspicious user agents
 */
function handleSecurityFiltering(request: NextRequest): NextResponse | null {
  const userAgent = request.headers.get('user-agent') || ''
  const { pathname } = request.nextUrl
  const isWebhookEndpoint = pathname.startsWith('/api/webhooks/trigger/')
  const isMcpEndpoint = pathname.startsWith('/api/mcp/')
  const isMcpOauthDiscoveryEndpoint =
    pathname.startsWith('/.well-known/oauth-authorization-server') ||
    pathname.startsWith('/.well-known/oauth-protected-resource')
  const isSuspicious = SUSPICIOUS_UA_PATTERNS.some((pattern) => pattern.test(userAgent))

  // Block suspicious requests, but exempt machine-to-machine endpoints that may
  // legitimately omit User-Agent headers (webhooks and MCP protocol discovery/calls).
  if (isSuspicious && !isWebhookEndpoint && !isMcpEndpoint && !isMcpOauthDiscoveryEndpoint) {
    logger.warn('Blocked suspicious request', {
      userAgent,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      url: request.url,
      method: request.method,
      pattern: SUSPICIOUS_UA_PATTERNS.find((pattern) => pattern.test(userAgent))?.toString(),
    })

    return new NextResponse(null, {
      status: 403,
      statusText: 'Forbidden',
      headers: {
        'Content-Type': 'text/plain',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "default-src 'none'",
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  }

  return null
}

/**
 * Set Enduria user context headers on the response
 */
function setUserContextHeaders(
  response: NextResponse,
  orgId: string,
  userId: string,
  role: string,
  email: string
): void {
  response.headers.set('x-enduria-org-id', orgId)
  response.headers.set('x-enduria-user-id', userId)
  response.headers.set('x-enduria-role', role)
  response.headers.set('x-enduria-email', email)
}

/**
 * Set CSP headers for workspace/chat routes
 */
function maybeSetCSP(response: NextResponse, pathname: string): void {
  if (
    pathname.startsWith('/workspace') ||
    pathname.startsWith('/chat') ||
    pathname === '/'
  ) {
    response.headers.set('Content-Security-Policy', generateRuntimeCSP())
  }
}

export async function proxy(request: NextRequest) {
  const url = request.nextUrl
  const { pathname } = url

  // Security filtering first
  const securityBlock = handleSecurityFiltering(request)
  if (securityBlock) return securityBlock

  // Public paths pass through without auth
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Allow public access to chat pages (they handle their own auth)
  if (pathname.startsWith('/chat/')) {
    return NextResponse.next()
  }

  // Allow public access to template pages for SEO
  if (pathname.startsWith('/templates')) {
    return NextResponse.next()
  }

  // Allow public access to workspace template pages
  if (pathname.match(/^\/workspace\/[^/]+\/templates/)) {
    return NextResponse.next()
  }

  // Allow public access to form pages
  if (pathname.startsWith('/form/')) {
    return NextResponse.next()
  }

  // Check for internal API secret (service-to-service from Enduria)
  const s2sResult = handleInternalApiAuth(request)
  if (s2sResult) return s2sResult

  // If auth is disabled (dev mode behind DISABLE_AUTH=true), pass through with dev context
  if (isAuthDisabled) {
    const response = NextResponse.next()
    setUserContextHeaders(response, 'dev-org', 'dev-user', 'admin', 'dev@localhost')
    response.headers.set('Vary', 'User-Agent')
    maybeSetCSP(response, pathname)

    // Root path redirects to workspace in dev mode
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/workspace', request.url))
    }

    return response
  }

  // Extract and validate Enduria JWT token
  const token = extractToken(request)

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // For page routes, redirect to root (Enduria SaaS handles login flow)
    return NextResponse.redirect(new URL('/', request.url))
  }

  const payload = await validateJWT(token)

  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  const orgId = payload.orgId as string
  const userId = (payload.sub || payload.userId) as string

  if (!orgId || !userId) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token claims' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Root path: authenticated users go to workspace
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/workspace', request.url))
  }

  // Pass user context to downstream handlers via response headers
  const response = NextResponse.next()
  setUserContextHeaders(
    response,
    orgId,
    userId,
    (payload.role as string) || 'user',
    (payload.email as string) || ''
  )
  response.headers.set('Vary', 'User-Agent')
  maybeSetCSP(response, pathname)

  return response
}

export const config = {
  matcher: [
    '/', // Root path
    '/workspace/:path*', // Workspace routes
    '/chat/:path*', // Chat routes
    '/templates/:path*', // Template routes
    '/form/:path*', // Form routes
    '/api/:path*', // API routes
    '/.well-known/:path*', // OAuth discovery
    // Catch-all for other pages, excluding static assets and public directories
    '/((?!_next/static|_next/image|ingest|favicon.ico|logo/|static/|footer/|social/|enterprise/|favicon/|twitter/|robots.txt|sitemap.xml).*)',
  ],
}
