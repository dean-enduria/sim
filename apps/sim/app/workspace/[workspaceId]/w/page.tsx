'use client'

import { useEffect, useState, useCallback } from 'react'
import { createLogger } from '@sim/logger'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Workflow } from 'lucide-react'
import { useWorkflows } from '@/hooks/queries/workflows'
import { useWorkflowRegistry } from '@/stores/workflows/registry/store'
import { Button } from '@/components/emcn'
import { useWorkflowOperations } from '@/app/workspace/[workspaceId]/w/components/sidebar/hooks'
import { useUserPermissionsContext } from '@/app/workspace/[workspaceId]/providers/workspace-permissions-provider'

const logger = createLogger('WorkflowsPage')

export default function WorkflowsPage() {
  const router = useRouter()
  const { workflows } = useWorkflowRegistry()
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [isMounted, setIsMounted] = useState(false)

  const { isLoading, isError } = useWorkflows(workspaceId)
  const { isCreatingWorkflow, handleCreateWorkflow } = useWorkflowOperations({ workspaceId })
  const { canEdit } = useUserPermissionsContext()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-redirect to first workflow when available
  useEffect(() => {
    if (!isMounted || isLoading) return

    if (isError) {
      logger.error('Failed to load workflows for workspace')
      return
    }

    const workspaceWorkflows = Object.keys(workflows).filter((id) => {
      const workflow = workflows[id]
      return workflow.workspaceId === workspaceId
    })

    if (workspaceWorkflows.length > 0) {
      router.replace(`/workspace/${workspaceId}/w/${workspaceWorkflows[0]}`)
    }
  }, [isMounted, isLoading, workflows, workspaceId, router, isError])

  const onCreateWorkflow = useCallback(async () => {
    const workflowId = await handleCreateWorkflow()
    if (workflowId) {
      router.replace(`/workspace/${workspaceId}/w/${workflowId}`)
    }
  }, [handleCreateWorkflow, router, workspaceId])

  // Still loading — show spinner
  if (isLoading || !isMounted) {
    return (
      <div className='flex h-full w-full items-center justify-center bg-[var(--bg)]'>
        <div
          className='h-[18px] w-[18px] animate-spin rounded-full'
          style={{
            background:
              'conic-gradient(from 0deg, hsl(var(--muted-foreground)) 0deg 120deg, transparent 120deg 180deg, hsl(var(--muted-foreground)) 180deg 300deg, transparent 300deg 360deg)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 1.5px), black calc(100% - 1.5px))',
            WebkitMask:
              'radial-gradient(farthest-side, transparent calc(100% - 1.5px), black calc(100% - 1.5px))',
          }}
        />
      </div>
    )
  }

  // Has workflows but still here — redirecting
  const workspaceWorkflows = Object.keys(workflows).filter(
    (id) => workflows[id].workspaceId === workspaceId
  )
  if (workspaceWorkflows.length > 0) {
    return (
      <div className='flex h-full w-full items-center justify-center bg-[var(--bg)]'>
        <div
          className='h-[18px] w-[18px] animate-spin rounded-full'
          style={{
            background:
              'conic-gradient(from 0deg, hsl(var(--muted-foreground)) 0deg 120deg, transparent 120deg 180deg, hsl(var(--muted-foreground)) 180deg 300deg, transparent 300deg 360deg)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 1.5px), black calc(100% - 1.5px))',
            WebkitMask:
              'radial-gradient(farthest-side, transparent calc(100% - 1.5px), black calc(100% - 1.5px))',
          }}
        />
      </div>
    )
  }

  // No workflows — show empty state
  return (
    <div className='flex h-full w-full flex-col items-center justify-center bg-[var(--bg)]'>
      <div className='flex flex-col items-center gap-4 text-center max-w-sm'>
        <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-3)]'>
          <Workflow className='h-6 w-6 text-[var(--text-tertiary)]' />
        </div>
        <div className='space-y-1.5'>
          <h2 className='text-base font-semibold text-[var(--text-primary)]'>
            No workflows yet
          </h2>
          <p className='text-sm text-[var(--text-tertiary)]'>
            Create your first workflow to start building automations.
          </p>
        </div>
        {canEdit && (
          <Button
            onClick={onCreateWorkflow}
            disabled={isCreatingWorkflow}
            className='gap-2 mt-2'
          >
            <Plus className='h-4 w-4' />
            {isCreatingWorkflow ? 'Creating...' : 'Create Workflow'}
          </Button>
        )}
      </div>
    </div>
  )
}
