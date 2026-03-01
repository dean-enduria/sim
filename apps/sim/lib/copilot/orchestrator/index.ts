import { createLogger } from '@sim/logger'
import {
  getDirectProviderKey,
  isCopilotBackendAvailable,
  SIM_AGENT_API_URL,
} from '@/lib/copilot/constants'
import { prepareExecutionContext } from '@/lib/copilot/orchestrator/tool-executor'
import type { OrchestratorOptions, OrchestratorResult } from '@/lib/copilot/orchestrator/types'
import { env } from '@/lib/core/config/env'
import { buildToolCallSummaries, createStreamingContext, runStreamLoop } from './stream-core'

const logger = createLogger('CopilotOrchestrator')

export interface OrchestrateStreamOptions extends OrchestratorOptions {
  userId: string
  workflowId: string
  chatId?: string
}

/**
 * Direct AI provider fallback when the managed copilot backend is not available.
 * Makes a simple chat completion call to OpenAI or Anthropic.
 */
async function orchestrateDirectProvider(
  requestPayload: Record<string, unknown>,
  options: OrchestrateStreamOptions
): Promise<OrchestratorResult> {
  const providerKey = getDirectProviderKey()
  if (!providerKey) {
    return {
      success: false,
      content: '',
      contentBlocks: [],
      toolCalls: [],
      error:
        'No AI provider API key configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY_1 to use the copilot without the managed backend.',
    }
  }

  const message = (requestPayload.message as string) || ''
  const model = (requestPayload.model as string) || ''
  const conversationHistory = (requestPayload.conversationHistory as any[]) || []

  try {
    let content: string
    let conversationId: string | undefined

    if (providerKey.provider === 'openai') {
      content = await callOpenAIDirect(providerKey.apiKey, model, message, conversationHistory)
    } else {
      content = await callAnthropicDirect(providerKey.apiKey, model, message, conversationHistory)
    }

    conversationId = crypto.randomUUID()

    // Emit content event if streaming callback is provided
    if (options.onEvent) {
      await options.onEvent({ type: 'content', data: { content } })
      await options.onEvent({ type: 'done', data: {} })
    }

    const result: OrchestratorResult = {
      success: true,
      content,
      contentBlocks: [{ type: 'text', content, timestamp: Date.now() }],
      toolCalls: [],
      conversationId,
    }
    await options.onComplete?.(result)
    return result
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Direct AI call failed')
    logger.error('Direct AI provider call failed', { error: err.message })
    await options.onError?.(err)
    return {
      success: false,
      content: '',
      contentBlocks: [],
      toolCalls: [],
      error: err.message,
    }
  }
}

async function callOpenAIDirect(
  apiKey: string,
  model: string,
  message: string,
  conversationHistory: any[]
): Promise<string> {
  // Map copilot model names to OpenAI models
  const openaiModel = model.startsWith('claude') ? 'gpt-4o' : model.startsWith('gpt') ? model : 'gpt-4o'

  const messages = [
    {
      role: 'system' as const,
      content:
        'You are Sim Copilot, an AI assistant that helps users build and manage workflows. You provide helpful, concise responses about workflow creation, configuration, and troubleshooting.',
    },
    ...conversationHistory
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({ role: m.role as 'user' | 'assistant', content: String(m.content || '') })),
    { role: 'user' as const, content: message },
  ]

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: openaiModel,
      messages,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callAnthropicDirect(
  apiKey: string,
  model: string,
  message: string,
  conversationHistory: any[]
): Promise<string> {
  // Map copilot model names to Anthropic models
  const anthropicModel = model.startsWith('gpt') ? 'claude-sonnet-4-20250514' : model.startsWith('claude') ? model : 'claude-sonnet-4-20250514'

  const messages = [
    ...conversationHistory
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({ role: m.role as 'user' | 'assistant', content: String(m.content || '') })),
    { role: 'user' as const, content: message },
  ]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: anthropicModel,
      max_tokens: 4096,
      system:
        'You are Sim Copilot, an AI assistant that helps users build and manage workflows. You provide helpful, concise responses about workflow creation, configuration, and troubleshooting.',
      messages,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || ''
}

export async function orchestrateCopilotStream(
  requestPayload: Record<string, unknown>,
  options: OrchestrateStreamOptions
): Promise<OrchestratorResult> {
  // Fall back to direct AI provider calls when the managed copilot backend is not available
  if (!isCopilotBackendAvailable()) {
    logger.info('COPILOT_API_KEY not set, using direct AI provider fallback')
    return orchestrateDirectProvider(requestPayload, options)
  }

  const { userId, workflowId, chatId } = options
  const execContext = await prepareExecutionContext(userId, workflowId)

  const payloadMsgId = requestPayload?.messageId
  const context = createStreamingContext({
    chatId,
    messageId: typeof payloadMsgId === 'string' ? payloadMsgId : crypto.randomUUID(),
  })

  try {
    await runStreamLoop(
      `${SIM_AGENT_API_URL}/api/chat-completion-streaming`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(env.COPILOT_API_KEY ? { 'x-api-key': env.COPILOT_API_KEY } : {}),
        },
        body: JSON.stringify(requestPayload),
      },
      context,
      execContext,
      options
    )

    const result: OrchestratorResult = {
      success: context.errors.length === 0,
      content: context.accumulatedContent,
      contentBlocks: context.contentBlocks,
      toolCalls: buildToolCallSummaries(context),
      chatId: context.chatId,
      conversationId: context.conversationId,
      errors: context.errors.length ? context.errors : undefined,
    }
    await options.onComplete?.(result)
    return result
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Copilot orchestration failed')
    logger.error('Copilot orchestration failed', { error: err.message })
    await options.onError?.(err)
    return {
      success: false,
      content: '',
      contentBlocks: [],
      toolCalls: [],
      chatId: context.chatId,
      conversationId: context.conversationId,
      error: err.message,
    }
  }
}
