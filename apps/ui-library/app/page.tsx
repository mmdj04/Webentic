'use client'

import Link from 'next/link'
import { Textarea } from 'ui'
import { cn } from 'ui'

const LOGO = [
  '██╗    ██╗███████╗██████╗ ███████╗███╗   ██╗████████╗██╗ ██████╗',
  '██║    ██║██╔════╝██╔══██╗██╔════╝████╗  ██║╚══██╔══╝██║██╔════╝',
  '██║ █╗ ██║█████╗  ██████╔╝█████╗  ██╔██╗ ██║   ██║   ██║██║     ',
  '██║███╗██║██╔══╝  ██╔══██╗██╔══╝  ██║╚██╗██║   ██║   ██║██║     ',
  '╚███╔███╔╝███████╗██████╔╝███████╗██║ ╚████║   ██║   ██║╚██████╗',
  ' ╚══╝╚══╝ ╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝ ╚═════╝',
]

function PixelText({ className }: { className?: string }) {
  return (
    <pre
      className={cn(
        'font-mono leading-tight text-foreground select-none',
        'text-[clamp(6px,1.5vw,14px)] sm:text-[clamp(8px,1.8vw,18px)]',
        className
      )}
    >
      {LOGO.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </pre>
  )
}

const MODES = [
  {
    id: 'ui-library',
    label: 'UI Library',
    href: '/docs/getting-started/quickstart',
    description: 'Componentes e blocos React para projetos Supabase',
  },
  {
    id: 'design-system',
    label: 'Design System',
    href: 'https://supabase-design-system-kohl.vercel.app/design-system',
    description: 'Recursos de design para experiências consistentes',
  },
] as const

export default function HomePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl mx-auto">
        <PixelText className="mb-6" />

        <div className="relative rounded-xl border border-muted bg-surface-75 shadow-sm overflow-hidden">
          <div className="flex items-center gap-1.5 p-2 pb-0">
            {MODES.map((mode) => (
              <Link
                key={mode.id}
                href={mode.href}
                target={mode.href.startsWith('http') ? '_blank' : undefined}
                className="relative px-4 py-1.5 text-sm font-medium text-foreground-light rounded-t-md transition-colors hover:text-foreground hover:bg-overlay/50"
              >
                {mode.label}
              </Link>
            ))}
            <div className="flex-1 border-b border-muted self-stretch" />
          </div>

          <div className="p-4 pt-3">
            <div className="relative">
              <Textarea
                placeholder="Type a message..."
                className="min-h-[100px] font-mono text-sm resize-none"
                rows={3}
              />
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}
