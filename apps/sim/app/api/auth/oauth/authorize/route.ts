import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { env } from '@/lib/core/config/env'
import { getBaseUrl } from '@/lib/core/utils/urls'

const logger = createLogger('OAuthAuthorize')

interface OAuthProviderAuthConfig {
  authorizationUrl: string
  clientId: string
  scopes: string[]
  extraParams?: Record<string, string>
}

function getProviderAuthorizationConfig(providerId: string): OAuthProviderAuthConfig | null {
  // Map providerId to base provider for credential lookup
  const baseProvider = getBaseProvider(providerId)

  switch (baseProvider) {
    case 'google':
      return env.GOOGLE_CLIENT_ID
        ? {
            authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            clientId: env.GOOGLE_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
            extraParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          }
        : null
    case 'github':
      return env.GITHUB_CLIENT_ID
        ? {
            authorizationUrl: 'https://github.com/login/oauth/authorize',
            clientId: env.GITHUB_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'github-repo':
      return env.GITHUB_REPO_CLIENT_ID
        ? {
            authorizationUrl: 'https://github.com/login/oauth/authorize',
            clientId: env.GITHUB_REPO_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'microsoft':
      return env.MICROSOFT_CLIENT_ID
        ? {
            authorizationUrl:
              'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            clientId: env.MICROSOFT_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
            extraParams: {
              response_mode: 'query',
            },
          }
        : null
    case 'slack':
      return env.SLACK_CLIENT_ID
        ? {
            authorizationUrl: 'https://slack.com/oauth/v2/authorize',
            clientId: env.SLACK_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'notion':
      return env.NOTION_CLIENT_ID
        ? {
            authorizationUrl: 'https://api.notion.com/v1/oauth/authorize',
            clientId: env.NOTION_CLIENT_ID,
            scopes: [],
            extraParams: { owner: 'user' },
          }
        : null
    case 'jira':
      return env.JIRA_CLIENT_ID
        ? {
            authorizationUrl: 'https://auth.atlassian.com/authorize',
            clientId: env.JIRA_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
            extraParams: {
              audience: 'api.atlassian.com',
              prompt: 'consent',
            },
          }
        : null
    case 'confluence':
      return env.CONFLUENCE_CLIENT_ID
        ? {
            authorizationUrl: 'https://auth.atlassian.com/authorize',
            clientId: env.CONFLUENCE_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
            extraParams: {
              audience: 'api.atlassian.com',
              prompt: 'consent',
            },
          }
        : null
    case 'airtable':
      return env.AIRTABLE_CLIENT_ID
        ? {
            authorizationUrl: 'https://airtable.com/oauth2/v1/authorize',
            clientId: env.AIRTABLE_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'linear':
      return env.LINEAR_CLIENT_ID
        ? {
            authorizationUrl: 'https://linear.app/oauth/authorize',
            clientId: env.LINEAR_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'dropbox':
      return env.DROPBOX_CLIENT_ID
        ? {
            authorizationUrl: 'https://www.dropbox.com/oauth2/authorize',
            clientId: env.DROPBOX_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
            extraParams: { token_access_type: 'offline' },
          }
        : null
    case 'hubspot':
      return env.HUBSPOT_CLIENT_ID
        ? {
            authorizationUrl: 'https://app.hubspot.com/oauth/authorize',
            clientId: env.HUBSPOT_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'salesforce':
      return env.SALESFORCE_CLIENT_ID
        ? {
            authorizationUrl: 'https://login.salesforce.com/services/oauth2/authorize',
            clientId: env.SALESFORCE_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'pipedrive':
      return env.PIPEDRIVE_CLIENT_ID
        ? {
            authorizationUrl: 'https://oauth.pipedrive.com/oauth/authorize',
            clientId: env.PIPEDRIVE_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'x':
      return env.X_CLIENT_ID
        ? {
            authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
            clientId: env.X_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
            extraParams: { code_challenge: 'challenge', code_challenge_method: 'plain' },
          }
        : null
    case 'reddit':
      return env.REDDIT_CLIENT_ID
        ? {
            authorizationUrl: 'https://www.reddit.com/api/v1/authorize',
            clientId: env.REDDIT_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
            extraParams: { duration: 'permanent' },
          }
        : null
    case 'linkedin':
      return env.LINKEDIN_CLIENT_ID
        ? {
            authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
            clientId: env.LINKEDIN_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'zoom':
      return env.ZOOM_CLIENT_ID
        ? {
            authorizationUrl: 'https://zoom.us/oauth/authorize',
            clientId: env.ZOOM_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'webflow':
      return env.WEBFLOW_CLIENT_ID
        ? {
            authorizationUrl: 'https://webflow.com/oauth/authorize',
            clientId: env.WEBFLOW_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'asana':
      return env.ASANA_CLIENT_ID
        ? {
            authorizationUrl: 'https://app.asana.com/-/oauth_authorize',
            clientId: env.ASANA_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'attio':
      return env.ATTIO_CLIENT_ID
        ? {
            authorizationUrl: 'https://app.attio.com/authorize',
            clientId: env.ATTIO_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'wealthbox':
      return env.WEALTHBOX_CLIENT_ID
        ? {
            authorizationUrl: 'https://app.crmworkspace.com/oauth/authorize',
            clientId: env.WEALTHBOX_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'wordpress':
      return env.WORDPRESS_CLIENT_ID
        ? {
            authorizationUrl: 'https://public-api.wordpress.com/oauth2/authorize',
            clientId: env.WORDPRESS_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'spotify':
      return env.SPOTIFY_CLIENT_ID
        ? {
            authorizationUrl: 'https://accounts.spotify.com/authorize',
            clientId: env.SPOTIFY_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    case 'calcom':
      return env.CALCOM_CLIENT_ID
        ? {
            authorizationUrl: 'https://app.cal.com/auth/oauth2/authorize',
            clientId: env.CALCOM_CLIENT_ID,
            scopes: getScopesForProvider(providerId),
          }
        : null
    default:
      return null
  }
}

/**
 * Map a service-level providerId (e.g. 'google-email', 'google-drive') to its base provider
 */
function getBaseProvider(providerId: string): string {
  // Direct matches first
  const directProviders = [
    'slack', 'notion', 'jira', 'confluence', 'airtable', 'linear',
    'dropbox', 'hubspot', 'salesforce', 'pipedrive', 'x', 'reddit',
    'linkedin', 'zoom', 'webflow', 'asana', 'attio', 'wealthbox',
    'wordpress', 'spotify', 'calcom', 'trello', 'shopify',
  ]
  if (directProviders.includes(providerId)) return providerId

  // Google services all share same OAuth client
  if (providerId.startsWith('google') || providerId === 'vertex-ai') return 'google'

  // Microsoft services share same OAuth client
  if (providerId.startsWith('microsoft') || providerId === 'outlook' ||
      providerId === 'onedrive' || providerId === 'sharepoint') return 'microsoft'

  // GitHub variants
  if (providerId === 'github-repo') return 'github-repo'
  if (providerId.startsWith('github')) return 'github'

  return providerId
}

/**
 * Get scopes for a specific provider service from the OAUTH_PROVIDERS config.
 * We import dynamically to avoid pulling in React components on the server.
 */
function getScopesForProvider(providerId: string): string[] {
  // Hardcoded scope map for server-side use (OAUTH_PROVIDERS has React components)
  const scopeMap: Record<string, string[]> = {
    'google-email': [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels',
    ],
    'google-drive': [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive',
    ],
    'google-calendar': ['https://www.googleapis.com/auth/calendar'],
    'google-contacts': ['https://www.googleapis.com/auth/contacts'],
    'google-sheets': [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ],
    'google-docs': [
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive.file',
    ],
    'google-tasks': ['https://www.googleapis.com/auth/tasks'],
    'google-bigquery': ['https://www.googleapis.com/auth/bigquery'],
    'google-forms': [
      'https://www.googleapis.com/auth/forms.body',
      'https://www.googleapis.com/auth/forms.responses.readonly',
    ],
    'google-groups': [
      'https://www.googleapis.com/auth/admin.directory.group',
      'https://www.googleapis.com/auth/admin.directory.group.member',
    ],
    'vertex-ai': ['https://www.googleapis.com/auth/cloud-platform'],
    'microsoft-entra-id': [
      'openid', 'profile', 'email', 'offline_access',
      'User.ReadWrite.All', 'Group.ReadWrite.All', 'GroupMember.ReadWrite.All',
      'RoleManagement.ReadWrite.Directory', 'Directory.Read.All', 'Device.ReadWrite.All',
    ],
  }

  // Google services always need base profile scopes
  const baseProvider = getBaseProvider(providerId)
  if (baseProvider === 'google') {
    const serviceScopes = scopeMap[providerId] || []
    return [
      'openid',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      ...serviceScopes,
    ]
  }

  return scopeMap[providerId] || []
}

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const providerId = searchParams.get('providerId')
  const returnUrl = searchParams.get('returnUrl')

  if (!providerId) {
    return NextResponse.json({ error: 'providerId is required' }, { status: 400 })
  }

  const config = getProviderAuthorizationConfig(providerId)
  if (!config) {
    return NextResponse.json(
      { error: `OAuth not configured for provider: ${providerId}` },
      { status: 400 }
    )
  }

  const baseUrl = getBaseUrl()
  const callbackUrl = `${baseUrl}/api/auth/oauth/callback`

  // Store state for CSRF protection and to pass provider info
  const state = Buffer.from(
    JSON.stringify({
      providerId,
      userId: session.user.id,
      returnUrl: returnUrl || `${baseUrl}/w`,
      ts: Date.now(),
    })
  ).toString('base64url')

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    state,
    ...(config.scopes.length > 0 && { scope: config.scopes.join(' ') }),
    ...config.extraParams,
  })

  const authUrl = `${config.authorizationUrl}?${params.toString()}`

  logger.info(`Redirecting to OAuth authorization for provider: ${providerId}`)

  return NextResponse.redirect(authUrl)
}
