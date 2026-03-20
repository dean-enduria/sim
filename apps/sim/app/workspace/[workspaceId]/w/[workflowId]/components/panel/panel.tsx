'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { createLogger } from '@sim/logger'
import {
  ArrowUp,
  Blocks,
  Lock,
  ScrollText,
  SlidersHorizontal,
  Sparkles,
  Square,
  Unlock,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import {
  BubbleChatClose,
  BubbleChatPreview,
  Button,
  Copy,
  Layout,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  MoreHorizontal,
  Play,
  Popover,
  PopoverContent,
  PopoverItem,
  PopoverTrigger,
  Trash,
} from '@/components/emcn'
import { VariableIcon } from '@/components/icons'
import { generateWorkflowJson } from '@/lib/workflows/operations/import-export'
import { useRegisterGlobalCommands } from '@/app/workspace/[workspaceId]/providers/global-commands-provider'
import { useUserPermissionsContext } from '@/app/workspace/[workspaceId]/providers/workspace-permissions-provider'
import { createCommands } from '@/app/workspace/[workspaceId]/utils/commands-utils'
import {
  Copilot,
  Deploy,
  Editor,
  Toolbar,
} from '@/app/workspace/[workspaceId]/w/[workflowId]/components/panel/components'
import {
  usePanelResize,
  useUsageLimits,
} from '@/app/workspace/[workspaceId]/w/[workflowId]/components/panel/hooks'
import { Terminal } from '@/app/workspace/[workspaceId]/w/[workflowId]/components/terminal/terminal'
import { Variables } from '@/app/workspace/[workspaceId]/w/[workflowId]/components/variables/variables'
import { useAutoLayout } from '@/app/workspace/[workspaceId]/w/[workflowId]/hooks/use-auto-layout'
import { useCurrentWorkflow } from '@/app/workspace/[workspaceId]/w/[workflowId]/hooks/use-current-workflow'
import { useWorkflowExecution } from '@/app/workspace/[workspaceId]/w/[workflowId]/hooks/use-workflow-execution'
import { getWorkflowLockToggleIds } from '@/app/workspace/[workspaceId]/w/[workflowId]/utils'
import { useDeleteWorkflow, useImportWorkflow } from '@/app/workspace/[workspaceId]/w/hooks'
import { useCollaborativeWorkflow } from '@/hooks/use-collaborative-workflow'
import { usePermissionConfig } from '@/hooks/use-permission-config'
import { useChatStore } from '@/stores/chat/store'
import { useNotificationStore } from '@/stores/notifications/store'
import type { PanelTab } from '@/stores/panel'
import { usePanelStore, useVariablesStore as usePanelVariablesStore } from '@/stores/panel'
import { useVariablesStore } from '@/stores/variables/store'
import { getWorkflowWithValues } from '@/stores/workflows'
import { useWorkflowRegistry } from '@/stores/workflows/registry/store'
import { useWorkflowStore } from '@/stores/workflows/workflow/store'

const logger = createLogger('Panel')
/**
 * Panel component with resizable width and tab navigation that persists across page refreshes.
 *
 * Uses a CSS-based approach to prevent hydration mismatches and flash on load:
 * 1. Width is controlled by CSS variable (--panel-width)
 * 2. Blocking script in layout.tsx sets CSS variable and data-panel-active-tab before React hydrates
 * 3. CSS rules control initial visibility based on data-panel-active-tab attribute
 * 4. React takes over visibility control after hydration completes
 * 5. Store updates CSS variable when width changes
 *
 * This ensures server and client render identical HTML, preventing hydration errors and visual flash.
 *
 * Note: All tabs are kept mounted but hidden to preserve component state during tab switches.
 * This prevents unnecessary remounting which would trigger data reloads and reset state.
 *
 * @returns Panel on the right side of the workflow
 */
export const Panel = memo(function Panel() {
  const router = useRouter()
  const params = useParams()
  const workspaceId = params.workspaceId as string

  const panelRef = useRef<HTMLElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { activeTab, setActiveTab, panelWidth, _hasHydrated, setHasHydrated } = usePanelStore(
    useShallow((state) => ({
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
      panelWidth: state.panelWidth,
      _hasHydrated: state._hasHydrated,
      setHasHydrated: state.setHasHydrated,
    }))
  )
  const copilotRef = useRef<{
    createNewChat: () => void
    setInputValueAndFocus: (value: string) => void
    focusInput: () => void
  }>(null)
  const toolbarRef = useRef<{
    focusSearch: () => void
  } | null>(null)

  // State
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAutoLayouting, setIsAutoLayouting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Hooks
  const userPermissions = useUserPermissionsContext()
  const { config: permissionConfig } = usePermissionConfig()
  const { isImporting, handleFileChange } = useImportWorkflow({ workspaceId })
  const { workflows, activeWorkflowId, duplicateWorkflow, hydration } = useWorkflowRegistry(
    useShallow((state) => ({
      workflows: state.workflows,
      activeWorkflowId: state.activeWorkflowId,
      duplicateWorkflow: state.duplicateWorkflow,
      hydration: state.hydration,
    }))
  )
  const isRegistryLoading =
    hydration.phase === 'idle' ||
    hydration.phase === 'metadata-loading' ||
    hydration.phase === 'state-loading'
  const { handleAutoLayout: autoLayoutWithFitView } = useAutoLayout(activeWorkflowId || null)

  // Check for locked blocks (disables auto-layout)
  const hasLockedBlocks = useWorkflowStore((state) =>
    Object.values(state.blocks).some((block) => block.locked)
  )

  const allBlocksLocked = useWorkflowStore((state) => {
    const blockList = Object.values(state.blocks)
    return blockList.length > 0 && blockList.every((block) => block.locked)
  })

  const hasBlocks = useWorkflowStore((state) => Object.keys(state.blocks).length > 0)

  const { collaborativeBatchToggleLocked } = useCollaborativeWorkflow()

  // Delete workflow hook
  const { isDeleting, handleDeleteWorkflow } = useDeleteWorkflow({
    workspaceId,
    workflowIds: activeWorkflowId || '',
    isActive: true,
    onSuccess: () => setIsDeleteModalOpen(false),
  })

  // Usage limits hook
  const { usageExceeded } = useUsageLimits({
    context: 'user',
    autoRefresh: !isRegistryLoading,
  })

  // Workflow execution hook
  const { handleRunWorkflow, handleCancelExecution, isExecuting } = useWorkflowExecution()

  // Panel resize hook
  const { handleMouseDown } = usePanelResize()

  /**
   * Opens subscription settings modal
   */
  const openSubscriptionSettings = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-settings', {
          detail: { tab: 'subscription' },
        })
      )
    }
  }

  /**
   * Cancels the currently executing workflow
   */
  const cancelWorkflow = useCallback(async () => {
    await handleCancelExecution()
  }, [handleCancelExecution])

  /**
   * Runs the workflow with usage limit check
   */
  const runWorkflow = useCallback(async () => {
    if (usageExceeded) {
      openSubscriptionSettings()
      return
    }
    await handleRunWorkflow()
  }, [usageExceeded, handleRunWorkflow])

  // Chat state
  const { isChatOpen, setIsChatOpen } = useChatStore(
    useShallow((state) => ({
      isChatOpen: state.isChatOpen,
      setIsChatOpen: state.setIsChatOpen,
    }))
  )
  const { isOpen: isVariablesOpen, setIsOpen: setVariablesOpen } = useVariablesStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      setIsOpen: state.setIsOpen,
    }))
  )

  const currentWorkflow = activeWorkflowId ? workflows[activeWorkflowId] : null
  const { isSnapshotView } = useCurrentWorkflow()

  /**
   * Mark hydration as complete on mount
   * This allows React to take over visibility control from CSS
   */
  useEffect(() => {
    setHasHydrated(true)
  }, [setHasHydrated])

  /**
   * Handles tab click events
   */
  const handleTabClick = (tab: PanelTab) => {
    setActiveTab(tab)
  }

  /**
   * Downloads a file with the given content
   */
  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    try {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      logger.error('Failed to download file:', error)
    }
  }, [])

  /**
   * Handles auto-layout of workflow blocks
   */
  const handleAutoLayout = useCallback(async () => {
    if (isExecuting || !userPermissions.canEdit || isAutoLayouting) {
      return
    }

    setIsAutoLayouting(true)
    try {
      const result = await autoLayoutWithFitView()
      if (!result.success && result.error) {
        useNotificationStore.getState().addNotification({
          level: 'info',
          message: result.error,
          workflowId: activeWorkflowId || undefined,
        })
      }
    } finally {
      setIsAutoLayouting(false)
    }
  }, [
    isExecuting,
    userPermissions.canEdit,
    isAutoLayouting,
    autoLayoutWithFitView,
    activeWorkflowId,
  ])

  /**
   * Handles exporting workflow as JSON
   */
  const handleExportJson = useCallback(async () => {
    if (!currentWorkflow || !activeWorkflowId) {
      logger.warn('No active workflow to export')
      return
    }

    setIsExporting(true)
    try {
      const workflow = getWorkflowWithValues(activeWorkflowId)

      if (!workflow || !workflow.state) {
        throw new Error('No workflow state found')
      }

      const workflowVariables = usePanelVariablesStore
        .getState()
        .getVariablesByWorkflowId(activeWorkflowId)

      const jsonContent = generateWorkflowJson(workflow.state, {
        workflowId: activeWorkflowId,
        name: currentWorkflow.name,
        description: currentWorkflow.description,
        variables: workflowVariables.map((v) => ({
          id: v.id,
          name: v.name,
          type: v.type,
          value: v.value,
        })),
      })

      const filename = `${currentWorkflow.name.replace(/[^a-z0-9]/gi, '-')}.json`
      downloadFile(jsonContent, filename, 'application/json')
      logger.info('Workflow exported as JSON')
    } catch (error) {
      logger.error('Failed to export workflow as JSON:', error)
    } finally {
      setIsExporting(false)
      setIsMenuOpen(false)
    }
  }, [currentWorkflow, activeWorkflowId, downloadFile])

  /**
   * Handles duplicating the current workflow
   */
  const handleDuplicateWorkflow = useCallback(async () => {
    if (!activeWorkflowId || !userPermissions.canEdit || isDuplicating) {
      return
    }

    setIsDuplicating(true)
    try {
      const newWorkflow = await duplicateWorkflow(activeWorkflowId)
      if (newWorkflow) {
        router.push(`/workspace/${workspaceId}/w/${newWorkflow}`)
      }
    } catch (error) {
      logger.error('Error duplicating workflow:', error)
    } finally {
      setIsDuplicating(false)
      setIsMenuOpen(false)
    }
  }, [
    activeWorkflowId,
    userPermissions.canEdit,
    isDuplicating,
    duplicateWorkflow,
    router,
    workspaceId,
  ])

  /**
   * Toggles the locked state of all blocks in the workflow
   */
  const handleToggleWorkflowLock = useCallback(() => {
    const blocks = useWorkflowStore.getState().blocks
    const allLocked = Object.values(blocks).every((b) => b.locked)
    const ids = getWorkflowLockToggleIds(blocks, !allLocked)
    if (ids.length > 0) collaborativeBatchToggleLocked(ids)
    setIsMenuOpen(false)
  }, [collaborativeBatchToggleLocked])

  // Compute run button state
  const canRun = userPermissions.canRead // Running only requires read permissions
  const isLoadingPermissions = userPermissions.isLoading
  const hasValidationErrors = false // TODO: Add validation logic if needed
  const isWorkflowBlocked = isExecuting || hasValidationErrors
  const isButtonDisabled = !isExecuting && (isWorkflowBlocked || (!canRun && !isLoadingPermissions))

  /**
   * Register global keyboard shortcuts using the central commands registry.
   *
   * - Mod+Enter: Run / cancel workflow (matches the Run button behavior)
   * - Mod+F: Focus Toolbar tab and search input
   */
  useRegisterGlobalCommands(() =>
    createCommands([
      {
        id: 'run-workflow',
        handler: () => {
          if (isExecuting) {
            void cancelWorkflow()
          } else {
            void runWorkflow()
          }
        },
        overrides: {
          allowInEditable: false,
        },
      },
      {
        id: 'focus-toolbar-search',
        handler: () => {
          setActiveTab('toolbar')
          toolbarRef.current?.focusSearch()
        },
        overrides: {
          allowInEditable: false,
        },
      },
    ])
  )

  return (
    <>
      <aside
        ref={panelRef}
        className='panel-container fixed top-16 bottom-0 right-0 z-10 overflow-hidden bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border-l border-[var(--glass-border)] shadow-[inset_1px_0_0_0_rgba(255,255,255,0.06),inset_0_1px_0_0_rgba(255,255,255,0.04)]'
        aria-label='Workflow panel'
      >
        <div className='flex h-full flex-col'>
          {/* Icon Tab Bar */}
          <div className='flex flex-shrink-0 items-center justify-between border-b border-[var(--border)] px-[6px] py-[5px]'>
            {/* Tab Icons */}
            <div className='flex items-center gap-[2px]'>
              {!permissionConfig.hideCopilot && (
                <button
                  type='button'
                  className={`relative flex h-[30px] items-center gap-[5px] rounded-[8px] px-[10px] text-[12px] font-medium transition-all duration-150 ${
                    _hasHydrated && activeTab === 'copilot'
                      ? 'bg-[var(--surface-5)] text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-4)] hover:text-[var(--text-secondary)]'
                  }`}
                  onClick={() => handleTabClick('copilot')}
                  data-tab-button='copilot'
                >
                  <Sparkles className='h-[13px] w-[13px]' />
                  <span>Copilot</span>
                  {_hasHydrated && activeTab === 'copilot' && (
                    <div className='absolute bottom-0 left-[10px] right-[10px] h-[2px] rounded-full bg-[var(--glow-primary)]' />
                  )}
                </button>
              )}
              <button
                type='button'
                className={`relative flex h-[30px] items-center gap-[5px] rounded-[8px] px-[10px] text-[12px] font-medium transition-all duration-150 ${
                  _hasHydrated && activeTab === 'toolbar'
                    ? 'bg-[var(--surface-5)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-4)] hover:text-[var(--text-secondary)]'
                }`}
                onClick={() => handleTabClick('toolbar')}
                data-tab-button='toolbar'
              >
                <Blocks className='h-[13px] w-[13px]' />
                <span>Blocks</span>
                {_hasHydrated && activeTab === 'toolbar' && (
                  <div className='absolute bottom-0 left-[10px] right-[10px] h-[2px] rounded-full bg-[var(--glow-primary)]' />
                )}
              </button>
              <button
                type='button'
                className={`relative flex h-[30px] items-center gap-[5px] rounded-[8px] px-[10px] text-[12px] font-medium transition-all duration-150 ${
                  _hasHydrated && activeTab === 'editor'
                    ? 'bg-[var(--surface-5)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-4)] hover:text-[var(--text-secondary)]'
                }`}
                onClick={() => handleTabClick('editor')}
                data-tab-button='editor'
              >
                <SlidersHorizontal className='h-[13px] w-[13px]' />
                <span>Editor</span>
                {_hasHydrated && activeTab === 'editor' && (
                  <div className='absolute bottom-0 left-[10px] right-[10px] h-[2px] rounded-full bg-[var(--glow-primary)]' />
                )}
              </button>
              <button
                type='button'
                className={`relative flex h-[30px] items-center gap-[5px] rounded-[8px] px-[10px] text-[12px] font-medium transition-all duration-150 ${
                  _hasHydrated && activeTab === 'logs'
                    ? 'bg-[var(--surface-5)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-4)] hover:text-[var(--text-secondary)]'
                }`}
                onClick={() => handleTabClick('logs')}
                data-tab-button='logs'
              >
                <ScrollText className='h-[13px] w-[13px]' />
                <span>Logs</span>
                {_hasHydrated && activeTab === 'logs' && (
                  <div className='absolute bottom-0 left-[10px] right-[10px] h-[2px] rounded-full bg-[var(--glow-primary)]' />
                )}
              </button>
            </div>

            {/* Utility actions */}
            <div className='flex items-center gap-[2px]'>
              <Button
                className='h-[28px] w-[28px] rounded-[8px] p-0'
                variant={isChatOpen ? 'active' : 'ghost'}
                onClick={() => setIsChatOpen(!isChatOpen)}
              >
                {isChatOpen ? <BubbleChatClose /> : <BubbleChatPreview />}
              </Button>
              <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <PopoverTrigger asChild>
                  <Button className='h-[28px] w-[28px] rounded-[8px] p-0' variant='ghost'>
                    <MoreHorizontal />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align='end' side='bottom' sideOffset={8}>
                  <PopoverItem
                    onClick={handleAutoLayout}
                    disabled={
                      isExecuting || !userPermissions.canEdit || isAutoLayouting || hasLockedBlocks
                    }
                    title={hasLockedBlocks ? 'Unlock blocks to use auto-layout' : undefined}
                  >
                    <Layout className='h-3 w-3' animate={isAutoLayouting} variant='clockwise' />
                    <span>Auto layout</span>
                  </PopoverItem>
                  <PopoverItem onClick={() => setVariablesOpen(!isVariablesOpen)}>
                    <VariableIcon className='h-3 w-3' />
                    <span>Variables</span>
                  </PopoverItem>
                  {userPermissions.canAdmin && !isSnapshotView && (
                    <PopoverItem onClick={handleToggleWorkflowLock} disabled={!hasBlocks}>
                      {allBlocksLocked ? (
                        <Unlock className='h-3 w-3' />
                      ) : (
                        <Lock className='h-3 w-3' />
                      )}
                      <span>{allBlocksLocked ? 'Unlock workflow' : 'Lock workflow'}</span>
                    </PopoverItem>
                  )}
                  <PopoverItem
                    onClick={handleExportJson}
                    disabled={!userPermissions.canEdit || isExporting || !currentWorkflow}
                  >
                    <ArrowUp className='h-3 w-3' />
                    <span>Export workflow</span>
                  </PopoverItem>
                  <PopoverItem
                    onClick={handleDuplicateWorkflow}
                    disabled={!userPermissions.canEdit || isDuplicating}
                  >
                    <Copy className='h-3 w-3' animate={isDuplicating} />
                    <span>Duplicate workflow</span>
                  </PopoverItem>
                  <PopoverItem
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsDeleteModalOpen(true)
                    }}
                    disabled={!userPermissions.canEdit || Object.keys(workflows).length <= 1}
                  >
                    <Trash className='h-3 w-3' />
                    <span>Delete workflow</span>
                  </PopoverItem>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tab Content - Keep all tabs mounted but hidden to preserve state */}
          <div className='flex-1 overflow-hidden'>
            {!permissionConfig.hideCopilot && (
              <div
                className={
                  _hasHydrated && activeTab === 'copilot'
                    ? 'h-full'
                    : _hasHydrated
                      ? 'hidden'
                      : 'h-full'
                }
                data-tab-content='copilot'
              >
                <Copilot ref={copilotRef} panelWidth={panelWidth} />
              </div>
            )}
            <div
              className={
                _hasHydrated && activeTab === 'editor'
                  ? 'h-full'
                  : _hasHydrated
                    ? 'hidden'
                    : 'h-full'
              }
              data-tab-content='editor'
            >
              <Editor />
            </div>
            <div
              className={
                _hasHydrated && activeTab === 'toolbar'
                  ? 'h-full'
                  : _hasHydrated
                    ? 'hidden'
                    : 'h-full'
              }
              data-tab-content='toolbar'
            >
              <Toolbar ref={toolbarRef} isActive={activeTab === 'toolbar'} />
            </div>
            <div
              className={
                _hasHydrated && activeTab === 'logs'
                  ? 'h-full [&_.terminal-container]:!static [&_.terminal-container]:!inset-auto [&_.terminal-container]:h-full [&_.terminal-container]:w-full [&_.terminal-container]:border-t-0'
                  : _hasHydrated
                    ? 'hidden'
                    : 'h-full'
              }
              data-tab-content='logs'
            >
              <Terminal />
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className='flex flex-shrink-0 items-center justify-end gap-[6px] border-t border-[var(--border)] px-[8px] py-[6px]'>
            <Deploy
              activeWorkflowId={activeWorkflowId}
              userPermissions={userPermissions}
              className='h-[32px] rounded-[10px] border border-[var(--border-1)] px-[14px] text-[12px] font-medium'
            />
            <button
              type='button'
              className={`flex h-[32px] items-center gap-[6px] rounded-[10px] px-[14px] text-[12px] font-medium transition-all duration-150 ${
                isExecuting
                  ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                  : 'bg-[var(--glow-primary)] text-white hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100'
              }`}
              onClick={isExecuting ? cancelWorkflow : () => runWorkflow()}
              disabled={!isExecuting && isButtonDisabled}
            >
              {isExecuting ? (
                <Square className='h-[10px] w-[10px] fill-current' />
              ) : (
                <Play className='h-[10px] w-[10px]' />
              )}
              {isExecuting ? 'Stop' : 'Run'}
            </button>
          </div>
        </div>
      </aside>

      {/* Resize Handle */}
      <div
        className='fixed top-16 right-[calc(var(--panel-width)-4px)] bottom-0 z-20 w-[8px] cursor-ew-resize'
        onMouseDown={handleMouseDown}
        role='separator'
        aria-orientation='vertical'
        aria-label='Resize panel'
      />

      {/* Delete Confirmation Modal */}
      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <ModalContent size='sm'>
          <ModalHeader>Delete Workflow</ModalHeader>
          <ModalBody>
            <p className='text-[12px] text-[var(--text-secondary)]'>
              Are you sure you want to delete{' '}
              <span className='font-medium text-[var(--text-primary)]'>
                {currentWorkflow?.name ?? 'this workflow'}
              </span>
              ? This will permanently remove all associated blocks, executions, and configuration.{' '}
              <span className='text-[var(--text-error)]'>This action cannot be undone.</span>
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='default'
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDeleteWorkflow} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Floating Variables Modal */}
      <Variables />
    </>
  )
})
