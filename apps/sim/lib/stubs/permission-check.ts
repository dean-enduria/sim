/**
 * Stubbed permission-check utilities.
 * Enterprise access-control has been removed — Enduria manages RBAC.
 * All validation functions are no-ops that allow everything.
 */

import {
  getAllowedIntegrationsFromEnv,
} from '@/lib/core/config/feature-flags'
import {
  DEFAULT_PERMISSION_GROUP_CONFIG,
  type PermissionGroupConfig,
} from '@/lib/permission-groups/types'
import type { ExecutionContext } from '@/executor/types'

export class ProviderNotAllowedError extends Error {
  constructor(providerId: string, model: string) {
    super(
      `Provider "${providerId}" is not allowed for model "${model}" based on your permission group settings`
    )
    this.name = 'ProviderNotAllowedError'
  }
}

export class IntegrationNotAllowedError extends Error {
  constructor(blockType: string, reason?: string) {
    super(
      reason
        ? `Integration "${blockType}" is not allowed: ${reason}`
        : `Integration "${blockType}" is not allowed based on your permission group settings`
    )
    this.name = 'IntegrationNotAllowedError'
  }
}

export class McpToolsNotAllowedError extends Error {
  constructor() {
    super('MCP tools are not allowed based on your permission group settings')
    this.name = 'McpToolsNotAllowedError'
  }
}

export class CustomToolsNotAllowedError extends Error {
  constructor() {
    super('Custom tools are not allowed based on your permission group settings')
    this.name = 'CustomToolsNotAllowedError'
  }
}

export class SkillsNotAllowedError extends Error {
  constructor() {
    super('Skills are not allowed based on your permission group settings')
    this.name = 'SkillsNotAllowedError'
  }
}

export class InvitationsNotAllowedError extends Error {
  constructor() {
    super('Invitations are not allowed based on your permission group settings')
    this.name = 'InvitationsNotAllowedError'
  }
}

export class PublicApiNotAllowedError extends Error {
  constructor() {
    super('Public API access is not allowed based on your permission group settings')
    this.name = 'PublicApiNotAllowedError'
  }
}

/**
 * Merges the env allowlist into a permission config.
 * Preserves env-based integration restrictions even without enterprise access-control.
 */
function mergeEnvAllowlist(config: PermissionGroupConfig | null): PermissionGroupConfig | null {
  const envAllowlist = getAllowedIntegrationsFromEnv()

  if (envAllowlist === null) {
    return config
  }

  if (config === null) {
    return { ...DEFAULT_PERMISSION_GROUP_CONFIG, allowedIntegrations: envAllowlist }
  }

  const merged =
    config.allowedIntegrations === null
      ? envAllowlist
      : config.allowedIntegrations
          .map((i) => i.toLowerCase())
          .filter((i) => envAllowlist.includes(i))

  return { ...config, allowedIntegrations: merged }
}

export async function getUserPermissionConfig(
  _userId: string
): Promise<PermissionGroupConfig | null> {
  // Enterprise access-control removed — just apply env allowlist
  return mergeEnvAllowlist(null)
}

export async function getPermissionConfig(
  userId: string | undefined,
  ctx?: ExecutionContext
): Promise<PermissionGroupConfig | null> {
  if (!userId) {
    return null
  }

  if (ctx) {
    if (ctx.permissionConfigLoaded) {
      return ctx.permissionConfig ?? null
    }

    const config = await getUserPermissionConfig(userId)
    ctx.permissionConfig = config
    ctx.permissionConfigLoaded = true
    return config
  }

  return getUserPermissionConfig(userId)
}

export async function validateModelProvider(
  _userId: string | undefined,
  _model: string,
  _ctx?: ExecutionContext
): Promise<void> {
  // No-op — enterprise provider restrictions removed
}

export async function validateBlockType(
  userId: string | undefined,
  blockType: string,
  ctx?: ExecutionContext
): Promise<void> {
  if (blockType === 'start_trigger') {
    return
  }

  // Still enforce env-level integration allowlist
  const config = userId ? await getPermissionConfig(userId, ctx) : mergeEnvAllowlist(null)

  if (!config || config.allowedIntegrations === null) {
    return
  }

  if (!config.allowedIntegrations.includes(blockType.toLowerCase())) {
    const envAllowlist = getAllowedIntegrationsFromEnv()
    const blockedByEnv = envAllowlist !== null && !envAllowlist.includes(blockType.toLowerCase())
    if (blockedByEnv) {
      throw new IntegrationNotAllowedError(
        blockType,
        'blocked by server ALLOWED_INTEGRATIONS policy'
      )
    }
  }
}

export async function validateMcpToolsAllowed(
  _userId: string | undefined,
  _ctx?: ExecutionContext
): Promise<void> {
  // No-op — enterprise permission group restrictions removed
}

export async function validateCustomToolsAllowed(
  _userId: string | undefined,
  _ctx?: ExecutionContext
): Promise<void> {
  // No-op — enterprise permission group restrictions removed
}

export async function validateSkillsAllowed(
  _userId: string | undefined,
  _ctx?: ExecutionContext
): Promise<void> {
  // No-op — enterprise permission group restrictions removed
}

export async function validateInvitationsAllowed(_userId: string | undefined): Promise<void> {
  const { isInvitationsDisabled } = await import('@/lib/core/config/feature-flags')
  if (isInvitationsDisabled) {
    throw new InvitationsNotAllowedError()
  }
  // No enterprise permission group check
}

export async function validatePublicApiAllowed(_userId: string | undefined): Promise<void> {
  const { isPublicApiDisabled } = await import('@/lib/core/config/feature-flags')
  if (isPublicApiDisabled) {
    throw new PublicApiNotAllowedError()
  }
  // No enterprise permission group check
}
