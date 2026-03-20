'use client'

export default function TemplatesLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className='relative flex min-h-screen flex-col font-season'>
      <div className='-z-50 pointer-events-none fixed inset-0 bg-white' />
      {children}
    </div>
  )
}
