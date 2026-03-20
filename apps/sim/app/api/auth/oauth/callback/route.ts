import { db } from '@sim/db'
import { account } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { and, eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/core/config/env'
import { getBaseUrl } from '@/lib/core/utils/urls'

const logger = createLogger('OAuthCallback')

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  scope?: string
  id_token?: string
}

interface StatePayload {
  providerId: string
  userId: string
  returnUrl: string
  ts: number
}

function getTokenConfig(providerId: string): {
  tokenEndpoint: string
  clientId: string
  clientSecret: string
  useBasicAuth: boolean
  additionalHeaders?: Record<string, string>
} | null {
  const baseProvider = getBaseProvider(providerId)

  switch (baseProvider) {
    case 'google':
      return env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? { tokenEndpoint: 'https://oauth2.googleapis.com/token', clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, useBasicAuth: false }
        : null
    case 'github':
      return env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
        ? { tokenEndpoint: 'https://github.com/login/oauth/access_token', clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET, useBasicAuth: false, additionalHeaders: { Accept: 'application/json' } }
        : null
    case 'github-repo':
      return env.GITHUB_REPO_CLIENT_ID && env.GITHUB_REPO_CLIENT_SECRET
        ? { tokenEndpoint: 'https://github.com/login/oauth/access_token', clientId: env.GITHUB_REPO_CLIENT_ID, clientSecret: env.GITHUB_REPO_CLIENT_SECRET, useBasicAuth: false, additionalHeaders: { Accept: 'application/json' } }
        : null
    case 'microsoft':
      return env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET
        ? { tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token', clientId: env.MICROSOFT_CLIENT_ID, clientSecret: env.MICROSOFT_CLIENT_SECRET, useBasicAuth: false }
        : null
    case 'slack':
      return env.SLACK_CLIENT_ID && env.SLACK_CLIENT_SECRET
        ? { tokenEndpoint: 'https://slack.com/api/oauth.v2.access', clientId: env.SLACK_CLIENT_ID, clientSecret: env.SLACK_CLIENT_SECRET, useBasicAuth: false }
        : null
    case 'notion':
      return env.NOTION_CLIENT_ID && env.NOTION_CLIENT_SECRET
        ? { tokenEndpoint: 'https://api.notion.com/v1/oauth/token', clientId: env.NOTION_CLIENT_ID, clientSecret: env.NOTION_CLIENT_SECRET, useBasicAuth: true }
        : null
    case 'jira':
      return env.JIRA_CLIENT_ID && env.JIRA_CLIENT_SECRET
        ? { tokenEndpoint: 'https://auth.atlassian.com/oauth/token', clientId: env.JIRA_CLIENT_ID, clientSecret: env.JIRA_CLIENT_SECRET, useBasicAuth: false }
        : null
    case 'confluence':
      return env.CONFLUENCE_CLIENT_ID && env.CONFLUENCE_CLIENT_SECRET
        ? { tokenEndpoint: 'https://auth.atlassian.com/oauth/token', clientId: env.CONFLUENCE_CLIENT_ID, clientSecret: env.CONFLUENCE_CLIENT_SECRET, useBasicAuth: false }
        : null
    case 'airtable':
      return env.AIRTABLE_CLIENT_ID && env.AIRTABLE_CLIENT_SECRET
        ? { tokenEndpoint: 'https://airtable.com/oauth2/v1/token', clientId: env.AIRTABLE_CLIENT_ID, clientSecret: env.AIRTABLE_CLIENT_SECRET, useBasicAuth: true }
        : null
    case 'linear':
      return env.LINEAR_CLIENT_ID && env.LINEAR_CLIENT_SECRET
        ? { tokenEndpoint: 'https://api.linear.app/oauth/token', clientId: env.LINEAR_CLIENT_ID, clientSecret: env.LINEAR_CLIENT_SECRET, useBasicAuth: false }
        : null
    case 'dropbox':
      return env.DROPBOX_CLIENT_ID && env.DROPBOX_CLIENT_SECRET
        ? { tokenEndpoint: 'https://api.dropboxapi.com/oauth2/token', clientId: env.DROPBOX_CLIENT_ID, clientSecret: env.DROPBOX_CLIENT_SECRET, useBasicAuth: true }
        : null
    case 'hubspot':
      return env.HUBSPOT_CLIENT_ID && env.HUBSPOT_CLIENT_SECRET
        ? { tokenEndpoint: 'https://api.hubapi.com/oauth/v1/token', clientId: env.HUBSPOT_CLIENT_ID, clientSecret: env.HUBSPOT_CLIENT_SECRET, useBasicAuth: false }
        : null
    case 'salesforce':
      return env.SALESFORCE_CLIENT_ID && env.SALESFORCE_CLIENT_SECRET
        ? { tokenEndpoint: 'https://login.salesforce.com/services/oauth2/token', clientId: env.SALESFORCE_CLIENT_ID, clientSecret: env.SALESFORCE_CLIENT_SECRET, useBasicAuth: false }
        : null
    case 'pipedrive':
      return env.PIPEDRIVE_CLIENT_ID && env.PIPEDRIVE_CLIENT_SECRET
        ? { tokenEndpoint: 'https://oauth.pipedrive.com/oauth/token', clientId: env.PIPEDRIVE_CLIENT_ID, clientSecret: env.PIPEDRIVE_CLIENT_SECRET, useBasicAuth: false }
        : null
    case 'x':
      return env.X_CLIENT_ID && env.X_CLIENT_SECRET
        ? { tokenEndpoint: 'https://api.x.com/2/oauth2/token', clientId: env.X_CLIENT_ID, clientSecret: env.X_CLIENT_SECRET, useBasicAuth: true }
        : null
    case 'reddit':
      return env.REDDIT_CLIENT_ID && env.REDDIT_CLIENT_SECRET
        ? { tokenEndpoint: 'https://www.reddit.com/api/v1/access_token', clientId: env.REDDIT_CLIENT_ID, clientSecret: env.REDDIT_CLIENT_SECRET, useBasicAuth: true }
        : null
    case 'linkedin':
      return env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET
        ? { tokenEndpoint: 'https://www.linkedin.com/oauth/v2/accessToken', clientId: env.LINKEDIN_CLIENT_ID, clientSecret: env.LINKEDIN_CLIENT_SECRET, useBasicAuth: false }
        : null
    case 'zoom':
      return env.ZOOM_CLIENT_ID && env.ZOOM_CLIENT_SECRET
        ? { tokenEndpoint: 'https://zoom.us/oauth/token', clientId: env.ZOOM_CLIENT_ID, clientSecret: env.ZOOM_CLIENT_SECRET, useBasicAuth: true }
        : null
    case 'webflow':
      return env.WEBFLOW_CLIENT_ID && env.WEBFLOW_CLIENT_SECRET
        ? { tokenEndpoint: 'https://api.webflow.com/oauth/access_token', clientId: env.WEBFLOW_CLIENT_ID, clientSecret: env.WEBFLOW_CLIENT_SECRET, useBasicAuth: false }
        : null
    case 'asana':
      return env.ASANA_CLIENT_ID && env.ASANA_CLIENT_SECRET
        ? { tokenEndpoint: 'https://app.asana.com/-/oauth_token', clientId: env.ASANA_CLIENT_ID, clientSecret: env.ASANA_CLIENT_SECRET, useBasicAuth: true }
        : null
    case 'attio':
      return env.ATTIO_CLIENT_ID && env.ATTIO_CLIENT_SECRET
        ? { tokenEndpoint: 'https://app.attio.com/oauth/token', clientId: env.ATTIO_CLIENT_ID, clientSecret: env.ATTIO_CLIENT_SECRET, useBasicAuth: false }
        : null
    case 'wealthbox':
      return env.WEALTHBOX_CLIENT_ID && env.WEALTHBOX_CLIENT_SECRET
        ? { tokenEndpoint: 'https://app.crmworkspace.com/oauth/token', clientId: env.WEALTHBOX_CLIENT_ID, clientSecret: env.WEALTHBOX_CLIENT_SECRET, useBasicAuth: false }
        : null
    case 'wordpress':
      return env.WORDPRESS_CLIENT_ID && env.WORDPRESS_CLIENT_SECRET
        ? { tokenEndpoint: 'https://public-api.wordpress.com/oauth2/token', clientId: env.WORDPRESS_CLIENT_ID, clientSecret: env.WORDPRESS_CLIENT_SECRET, useBasicAuth: false }
        : null
    case 'spotify':
      return env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET
        ? { tokenEndpoint: 'https://accounts.spotify.com/api/token', clientId: env.SPOTIFY_CLIENT_ID, clientSecret: env.SPOTIFY_CLIENT_SECRET, useBasicAuth: true }
        : null
    case 'calcom':
      return env.CALCOM_CLIENT_ID
        ? { tokenEndpoint: 'https://app.cal.com/api/auth/oauth2/token', clientId: env.CALCOM_CLIENT_ID, clientSecret: '', useBasicAuth: false }
        : null
    default:
      return null
  }
}

function getBaseProvider(providerId: string): string {
  const directProviders = [
    'slack', 'notion', 'jira', 'confluence', 'airtable', 'linear',
    'dropbox', 'hubspot', 'salesforce', 'pipedrive', 'x', 'reddit',
    'linkedin', 'zoom', 'webflow', 'asana', 'attio', 'wealthbox',
    'wordpress', 'spotify', 'calcom', 'trello', 'shopify',
  ]
  if (directProviders.includes(providerId)) return providerId
  if (providerId.startsWith('google') || providerId === 'vertex-ai') return 'google'
  if (providerId.startsWith('microsoft') || providerId === 'outlook' ||
      providerId === 'onedrive' || providerId === 'sharepoint') return 'microsoft'
  if (providerId === 'github-repo') return 'github-repo'
  if (providerId.startsWith('github')) return 'github'
  return providerId
}

/**
 * Try to get a meaningful account identifier from the token response or provider API.
 * Falls back to the providerId if we can't determine the user's identity.
 */
async function resolveAccountId(
  providerId: string,
  tokenData: TokenResponse
): Promise<string> {
  try {
    const baseProvider = getBaseProvider(providerId)

    if (baseProvider === 'google' && tokenData.access_token) {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
      if (res.ok) {
        const info = await res.json()
        return info.email || info.id || providerId
      }
    }

    if (baseProvider === 'github' && tokenData.access_token) {
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json' },
      })
      if (res.ok) {
        const info = await res.json()
        return info.login || info.email || String(info.id) || providerId
      }
    }

    if (baseProvider === 'microsoft' && tokenData.access_token) {
      const res = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
      if (res.ok) {
        const info = await res.json()
        return info.userPrincipalName || info.mail || info.id || providerId
      }
    }

    if (baseProvider === 'slack' && tokenData.access_token) {
      const res = await fetch('https://slack.com/api/auth.test', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
      if (res.ok) {
        const info = await res.json()
        return info.user || info.user_id || providerId
      }
    }
  } catch (error) {
    logger.warn(`Failed to resolve account ID for ${providerId}`, { error })
  }

  return providerId
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    logger.error('OAuth authorization error', { error, description: searchParams.get('error_description') })
    const baseUrl = getBaseUrl()
    return NextResponse.redirect(`${baseUrl}/w?oauth_error=${encodeURIComponent(error)}`)
  }

  if (!code || !stateParam) {
    return NextResponse.json({ error: 'Missing code or state parameter' }, { status: 400 })
  }

  // Decode state
  let state: StatePayload
  try {
    state = JSON.parse(Buffer.from(stateParam, 'base64url').toString())
  } catch {
    return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 })
  }

  // Validate state freshness (10 minute window)
  if (Date.now() - state.ts > 10 * 60 * 1000) {
    return NextResponse.json({ error: 'OAuth state expired' }, { status: 400 })
  }

  const { providerId, userId, returnUrl } = state

  const config = getTokenConfig(providerId)
  if (!config) {
    return NextResponse.json({ error: `OAuth not configured for provider: ${providerId}` }, { status: 400 })
  }

  const baseUrl = getBaseUrl()
  const callbackUrl = `${baseUrl}/api/auth/oauth/callback`

  // Exchange code for tokens
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    ...config.additionalHeaders,
  }

  const bodyParams: Record<string, string> = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: callbackUrl,
  }

  if (config.useBasicAuth) {
    const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
    headers.Authorization = `Basic ${basicAuth}`
  } else {
    bodyParams.client_id = config.clientId
    if (config.clientSecret) {
      bodyParams.client_secret = config.clientSecret
    }
  }

  try {
    const tokenResponse = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers,
      body: new URLSearchParams(bodyParams).toString(),
    })

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text()
      logger.error('Token exchange failed', { status: tokenResponse.status, body: errorBody, providerId })
      return NextResponse.redirect(`${returnUrl}?oauth_error=token_exchange_failed`)
    }

    const tokenData: TokenResponse = await tokenResponse.json()

    // Resolve account identity
    const accountId = await resolveAccountId(providerId, tokenData)

    const now = new Date()
    const id = crypto.randomUUID()

    // Check if account already exists for this user + provider + accountId
    const [existing] = await db
      .select({ id: account.id })
      .from(account)
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, providerId),
          eq(account.accountId, accountId)
        )
      )
      .limit(1)

    if (existing) {
      // Update existing account with new tokens
      await db
        .update(account)
        .set({
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || null,
          idToken: tokenData.id_token || null,
          accessTokenExpiresAt: tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null,
          scope: tokenData.scope || null,
          updatedAt: now,
        })
        .where(eq(account.id, existing.id))

      logger.info(`Updated OAuth account for provider: ${providerId}`, { userId, accountId })
    } else {
      // Create new account
      await db.insert(account).values({
        id,
        userId,
        providerId,
        accountId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        idToken: tokenData.id_token || null,
        accessTokenExpiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        scope: tokenData.scope || null,
        createdAt: now,
        updatedAt: now,
      })

      logger.info(`Created new OAuth account for provider: ${providerId}`, { userId, accountId })
    }

    return NextResponse.redirect(`${returnUrl}?oauth_success=${providerId}`)
  } catch (error) {
    logger.error('OAuth callback error', { error, providerId })
    return NextResponse.redirect(`${returnUrl}?oauth_error=internal_error`)
  }
}
