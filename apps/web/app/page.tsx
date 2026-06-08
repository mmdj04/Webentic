'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from 'ui'
import { cn } from 'ui'

const MODES = [
  {
    id: 'ui-library',
    label: 'UI Library',
    href: '/docs/getting-started/quickstart',
  },
  {
    id: 'design-system',
    label: 'Design System',
    href: '/design-system',
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
        <h1
          className={cn(
            'text-foreground select-none text-center font-bold tracking-tight',
            'text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-8'
          )}
        >
          Webentic
        </h1>

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
              <Input
                placeholder="Type a message..."
                className="font-mono text-sm pr-12"
              />
              <Link
                href={
                  activeMode
                    ? MODES.find((m) => m.id === activeMode)!.href
                    : '#'
                }
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center size-8 rounded-lg transition-colors',
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
