'use client'

import { useState } from 'react'
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
        'font-mono leading-tight text-foreground select-none text-center',
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
  },
  {
    id: 'design-system',
    label: 'Design System',
    href: 'https://webentic-ds.vercel.app/design-system',
  },
  {
    id: 'about',
    label: 'About Me',
    href: '/about',
  },
] as const

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<string | null>(null)

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <PixelText className="mb-6" />

        <div className="relative rounded-xl border border-muted bg-surface-75 shadow-sm overflow-hidden w-full">
          <div className="flex items-center gap-1.5 p-2 pb-0">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={cn(
                  'relative px-4 py-1.5 text-sm font-medium rounded-t-md transition-colors',
                  activeMode === mode.id
                    ? 'text-foreground bg-background border border-b-0 border-muted'
                    : 'text-foreground-light hover:text-foreground hover:bg-overlay/50'
                )}
              >
                {mode.label}
              </button>
            ))}
            <div className="flex-1 border-b border-muted self-stretch" />
          </div>

          <div className="p-4 pt-3">
            <div className="relative">
              <Textarea
                placeholder="Type a message..."
                className="min-h-[100px] font-mono text-sm resize-none pr-12"
                rows={3}
              />
              <Link
                href={
                  activeMode
                    ? MODES.find((m) => m.id === activeMode)!.href
                    : '#'
                }
                target={
                  activeMode &&
                  MODES.find((m) => m.id === activeMode)!.href.startsWith(
                    'http'
                  )
                    ? '_blank'
                    : undefined
                }
                className={cn(
                  'absolute bottom-3 right-3 inline-flex items-center justify-center size-8 rounded-lg transition-colors',
                  activeMode
                    ? 'bg-foreground text-background hover:opacity-90'
                    : 'bg-muted text-foreground-muted cursor-not-allowed pointer-events-none'
                )}
              >
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
