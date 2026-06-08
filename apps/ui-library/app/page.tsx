'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Textarea } from 'ui'
import { cn } from 'ui'

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
  const [activeMode, setActiveMode] = useState<string | null>(null)

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Supabase UI
          </h1>
          <p className="mt-2 text-sm text-foreground-light">
            Select a workspace to get started
          </p>
        </div>

        <div className="relative rounded-xl border border-muted bg-surface-75 shadow-sm overflow-hidden">
          <div className="flex items-center gap-1.5 p-2 pb-0">
            {MODES.map((mode) => (
              <Link
                key={mode.id}
                href={mode.href}
                target={mode.href.startsWith('http') ? '_blank' : undefined}
                onMouseEnter={() => setActiveMode(mode.id)}
                onMouseLeave={() => setActiveMode(null)}
                className={cn(
                  'relative px-4 py-1.5 text-sm font-medium rounded-t-md transition-colors',
                  activeMode === mode.id
                    ? 'text-foreground bg-background border border-b-0 border-muted'
                    : 'text-foreground-light hover:text-foreground hover:bg-overlay/50'
                )}
              >
                {mode.label}
              </Link>
            ))}
            <div className="flex-1 border-b border-muted self-stretch" />
          </div>

          <div className="p-4 pt-3">
            <div className="relative">
              <Textarea
                placeholder="Type a message or select a workspace above..."
                className="min-h-[100px] font-mono text-sm resize-none"
                rows={3}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="text-[10px] text-foreground-muted font-mono">
                  {activeMode
                    ? `Navigate to ${MODES.find((m) => m.id === activeMode)?.label}`
                    : 'Select a workspace'}
                </span>
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
                    'inline-flex items-center justify-center size-8 rounded-lg transition-colors',
                    activeMode
                      ? 'bg-foreground text-background hover:opacity-90'
                      : 'bg-muted text-foreground-muted cursor-not-allowed'
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

          {activeMode && (
            <div className="px-4 pb-4">
              <p className="text-xs text-foreground-light">
                {MODES.find((m) => m.id === activeMode)?.description}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-foreground-muted">
          <span>Hover over a workspace above</span>
          <span className="w-1 h-1 rounded-full bg-foreground-muted" />
          <span>Click to navigate</span>
        </div>
      </div>
    </div>
  )
}
