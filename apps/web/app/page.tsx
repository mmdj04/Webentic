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
        <div className="flex items-center gap-1 mb-10">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                activeMode === mode.id
                  ? 'text-foreground bg-muted'
                  : 'text-foreground-muted hover:text-foreground'
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <h1
          className={cn(
            'text-foreground select-none text-center font-bold tracking-tight',
            'text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-14'
          )}
        >
          Webentic
        </h1>

        <div className="relative w-full">
          <Input
            placeholder="Type a message..."
            className="font-mono text-sm pr-12 h-12"
          />
          <Link
            href={
              activeMode
                ? MODES.find((m) => m.id === activeMode)!.href
                : '#'
            }
            className={cn(
              'absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center size-9 rounded-md transition-colors',
              activeMode
                ? 'bg-foreground text-background hover:opacity-90'
                : 'text-foreground-muted cursor-not-allowed pointer-events-none'
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
  )
}
