'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/core/utils/cn'
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronDown,
  FileText,
  FolderKanban,
  FolderOpen,
  GitBranch,
  HardDrive,
  History,
  ListChecks,
  LogOut,
  Monitor,
  Moon,
  Package,
  Settings,
  Smartphone,
  Sun,
  Ticket,
  User,
  Workflow,
  Zap,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSession } from '@/lib/auth/auth-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  internal?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Service & Support',
    items: [
      { label: 'All Tickets', href: '/tickets', icon: Ticket },
      { label: 'My Tickets', href: '/tickets?assignedToMe=true', icon: User },
      { label: 'Incidents', href: '/tickets?type=incident', icon: AlertCircle },
      { label: 'Changes', href: '/tickets?type=change', icon: GitBranch },
    ],
  },
  {
    title: 'Projects & Work',
    items: [
      { label: 'Portfolio', href: '/projects', icon: FolderKanban },
      { label: 'My Tasks', href: '/tasks', icon: ListChecks },
      { label: 'Schedule', href: '/scheduling', icon: Calendar },
    ],
  },
  {
    title: 'Analytics & Reporting',
    items: [
      { label: 'Overview', href: '/analytics/overview', icon: BarChart3 },
      { label: 'Reports', href: '/analytics/reports/library', icon: FileText },
      { label: 'SLA', href: '/analytics/sla', icon: BarChart3 },
    ],
  },
  {
    title: 'Assets & Config',
    items: [
      { label: 'Hardware', href: '/assets?type=hardware', icon: HardDrive },
      { label: 'Agents', href: '/assets/agent', icon: Monitor },
      { label: 'Device Management', href: '/mdm', icon: Smartphone },
      { label: 'Software Licensing', href: '/licensing', icon: Package },
      { label: 'Inventory', href: '/inventory', icon: Package },
    ],
  },
  {
    title: 'Knowledge',
    items: [
      { label: 'Browse', href: '/knowledge', icon: BookOpen },
      { label: 'Drafts', href: '/knowledge?status=draft', icon: FileText },
      { label: 'Categories', href: '/knowledge/categories', icon: FolderOpen },
      { label: 'Analytics', href: '/knowledge/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'AI & Automation',
    items: [
      { label: 'Workflow Builder', href: '/workflows/workspace', icon: Workflow, internal: true },
      { label: 'Templates', href: '/workflows/templates', icon: Zap, internal: true },
      { label: 'Executions', href: '/workflows/workspace/logs', icon: History, internal: true },
    ],
  },
]

export function EnduriaHeader() {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const [moduleOpen, setModuleOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const moduleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close module dropdown on outside click
  useEffect(() => {
    if (!moduleOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (moduleRef.current && !moduleRef.current.contains(e.target as Node)) {
        setModuleOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [moduleOpen])

  // Close on Escape
  useEffect(() => {
    if (!moduleOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setModuleOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [moduleOpen])

  const userName = session?.user?.name || session?.user?.email || 'User'
  const userEmail = session?.user?.email || ''
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-16',
        // Match Enduria's glassmorphic header exactly
        'border-b border-[var(--border-soft)]',
        'bg-background/80 backdrop-blur-xl',
        'supports-[backdrop-filter]:bg-background/60'
      )}
    >
      <div className='flex h-16 items-center gap-4 px-4'>
        {/* Left: Logo + Module */}
        <div className='flex items-center gap-4 min-w-fit'>
          <a
            href='/dashboard'
            className='flex shrink-0 items-center rounded-lg px-1.5 py-1 transition-colors hover:bg-accent/40'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/enduria-dark.png'
              alt='Enduria'
              className='hidden h-9 w-auto object-contain dark:block md:h-10'
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/enduria-light.png'
              alt='Enduria'
              className='block h-9 w-auto object-contain dark:hidden md:h-10'
            />
          </a>

          <div className='hidden h-4 w-px bg-border/60 md:block' />

          {/* Module dropdown — matches Enduria's button styling */}
          <div className='relative hidden md:block' ref={moduleRef}>
            <button
              type='button'
              onClick={() => setModuleOpen(!moduleOpen)}
              className={cn(
                'flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium',
                'border border-[var(--border-soft)] bg-background/55',
                'text-muted-foreground hover:text-foreground',
                'hover:bg-accent/45 hover:border-[var(--border)]',
                'transition-colors group',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35'
              )}
            >
              <span className='font-semibold text-foreground group-hover:text-primary transition-colors'>
                Automation
              </span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform text-muted-foreground group-hover:text-primary',
                  moduleOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Mega-menu dropdown — matches Enduria's overlay styling */}
            {moduleOpen && (
              <div
                className={cn(
                  'absolute left-0 top-full mt-1',
                  'w-[580px] rounded-xl p-5',
                  'border border-[var(--border-soft)]',
                  'bg-background/95 backdrop-blur-xl',
                  'shadow-2xl',
                  'animate-in slide-in-from-top-2 duration-200'
                )}
              >
                <div className='grid grid-cols-2 gap-x-8 gap-y-6'>
                  {NAV_SECTIONS.map((section) => (
                    <div key={section.title} className='space-y-2'>
                      <h4 className='text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground border-b border-[var(--border-soft)] pb-1.5 mb-1'>
                        {section.title}
                      </h4>
                      <ul className='space-y-0.5'>
                        {section.items.map((item, index) => {
                          const Icon = item.icon
                          const isPrimary = index === 0
                          const linkClasses = cn(
                            'flex items-center gap-2.5 text-sm transition-all px-2 py-1.5 -mx-2 rounded-lg group/link',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
                            isPrimary
                              ? 'text-foreground font-medium hover:text-primary hover:bg-primary/5'
                              : 'text-muted-foreground/80 hover:text-primary hover:bg-accent/40'
                          )
                          const iconClasses = cn(
                            'h-4 w-4 transition-colors shrink-0',
                            isPrimary
                              ? 'text-primary/80 group-hover/link:text-primary'
                              : 'text-muted-foreground/50 group-hover/link:text-primary/70'
                          )

                          return (
                            <li key={item.href}>
                              {item.internal ? (
                                <Link
                                  href={item.href}
                                  onClick={() => setModuleOpen(false)}
                                  className={linkClasses}
                                >
                                  <Icon className={iconClasses} />
                                  {item.label}
                                </Link>
                              ) : (
                                <a
                                  href={item.href}
                                  onClick={() => setModuleOpen(false)}
                                  className={linkClasses}
                                >
                                  <Icon className={iconClasses} />
                                  {item.label}
                                </a>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className='flex-1' />

        {/* Right: Actions */}
        <div className='flex items-center gap-1.5'>
          {/* Theme toggle — matches Enduria exactly */}
          {mounted && (
            <button
              type='button'
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                'relative flex h-9 w-9 items-center justify-center',
                'rounded-xl border border-[var(--border-soft)] bg-background/60',
                'text-muted-foreground hover:text-primary hover:bg-accent/55',
                'transition-colors'
              )}
              aria-label='Toggle theme'
            >
              <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
              <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
            </button>
          )}

          {/* User menu */}
          <div className='flex items-center gap-2 pl-2 border-l border-[var(--border-soft)]'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type='button'
                  className={cn(
                    'flex h-9 w-9 items-center justify-center',
                    'rounded-full',
                    'bg-primary/10 text-xs font-semibold text-primary',
                    'ring-1 ring-primary/20',
                    'hover:bg-primary/20 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35'
                  )}
                >
                  {userInitial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium leading-none'>{userName}</p>
                    {userEmail && (
                      <p className='text-xs leading-none text-muted-foreground'>{userEmail}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href='/dashboard' className='cursor-pointer'>
                    <FolderKanban className='mr-2 h-4 w-4' />
                    Dashboard
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href='/settings' className='cursor-pointer'>
                    <Settings className='mr-2 h-4 w-4' />
                    Settings
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className='cursor-pointer'
                >
                  {theme === 'dark' ? (
                    <Sun className='mr-2 h-4 w-4' />
                  ) : (
                    <Moon className='mr-2 h-4 w-4' />
                  )}
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href='/logout' className='cursor-pointer text-destructive focus:text-destructive'>
                    <LogOut className='mr-2 h-4 w-4' />
                    Sign out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
