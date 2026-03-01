import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { isCopilotBackendAvailable, SIM_AGENT_API_URL } from '@/lib/copilot/constants'
import { authenticateCopilotRequestSessionOnly } from '@/lib/copilot/request-helpers'
import type { AvailableModel } from '@/lib/copilot/types'
import { env } from '@/lib/core/config/env'

const logger = createLogger('CopilotModelsAPI')

interface RawAvailableModel {
  id: string
  friendlyName?: string
  displayName?: string
  provider?: string
}

function isRawAvailableModel(item: unknown): item is RawAvailableModel {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    typeof (item as { id: unknown }).id === 'string'
  )
}

/**
 * Default models available when using direct AI provider keys
 * (no managed copilot backend).
 */
function getDirectProviderModels(): AvailableModel[] {
  const models: AvailableModel[] = []

  if (env.OPENAI_API_KEY || env.OPENAI_API_KEY_1) {
    models.push(
      { id: 'gpt-4o', friendlyName: 'GPT-4o', provider: 'openai' },
      { id: 'gpt-4o-mini', friendlyName: 'GPT-4o Mini', provider: 'openai' },
      { id: 'gpt-4-turbo', friendlyName: 'GPT-4 Turbo', provider: 'openai' }
    )
  }

  if (env.ANTHROPIC_API_KEY_1) {
    models.push(
      { id: 'claude-opus-4-20250514', friendlyName: 'Claude Opus 4', provider: 'anthropic' },
      { id: 'claude-sonnet-4-20250514', friendlyName: 'Claude Sonnet 4', provider: 'anthropic' },
      { id: 'claude-3-5-haiku-20241022', friendlyName: 'Claude 3.5 Haiku', provider: 'anthropic' }
    )
  }

  return models
}

export async function GET(_req: NextRequest) {
  const { userId, isAuthenticated } = await authenticateCopilotRequestSessionOnly()
  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // When no managed copilot backend, return models based on configured provider keys
  if (!isCopilotBackendAvailable()) {
    const models = getDirectProviderModels()
    return NextResponse.json({ success: true, models })
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (env.COPILOT_API_KEY) {
    headers['x-api-key'] = env.COPILOT_API_KEY
  }

  try {
    const response = await fetch(`${SIM_AGENT_API_URL}/api/get-available-models`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      logger.warn('Failed to fetch available models from copilot backend', {
        status: response.status,
      })
      return NextResponse.json(
        {
          success: false,
          error: payload?.error || 'Failed to fetch available models',
          models: [],
        },
        { status: response.status }
      )
    }

    const rawModels = Array.isArray(payload?.models) ? payload.models : []
    const models: AvailableModel[] = rawModels
      .filter((item: unknown): item is RawAvailableModel => isRawAvailableModel(item))
      .map((item: RawAvailableModel) => ({
        id: item.id,
        friendlyName: item.friendlyName || item.displayName || item.id,
        provider: item.provider || 'unknown',
      }))

    return NextResponse.json({ success: true, models })
  } catch (error) {
    logger.error('Error fetching available models', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch available models',
        models: [],
      },
      { status: 500 }
    )
  }
}
