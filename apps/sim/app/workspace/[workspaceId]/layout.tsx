'use client'

import { GlobalCommandsProvider } from '@/app/workspace/[workspaceId]/providers/global-commands-provider'
import { ProviderModelsLoader } from '@/app/workspace/[workspaceId]/providers/provider-models-loader'
import { SettingsLoader } from '@/app/workspace/[workspaceId]/providers/settings-loader'
import { WorkspacePermissionsProvider } from '@/app/workspace/[workspaceId]/providers/workspace-permissions-provider'
import { Sidebar } from '@/app/workspace/[workspaceId]/w/components/sidebar/sidebar'
import { EnduriaHeader } from '@/components/shared/enduria-header'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SettingsLoader />
      <ProviderModelsLoader />
      <EnduriaHeader />
      <GlobalCommandsProvider>
        <div className='mt-16 flex w-full bg-[var(--bg)]' style={{ height: 'calc(100vh - 64px)' }}>
          <WorkspacePermissionsProvider>
            <div className='shrink-0' suppressHydrationWarning>
              <Sidebar />
            </div>
            {children}
          </WorkspacePermissionsProvider>
        </div>
      </GlobalCommandsProvider>
    </>
  )
}
