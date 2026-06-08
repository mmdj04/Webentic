'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Textarea } from 'ui'
import { cn } from 'ui'

const FONT: Record<string, boolean[][]> = {
  W: [
    [true, false, false, false, true],
    [true, false, false, false, true],
    [true, false, true, false, true],
    [true, false, true, false, true],
    [true, true, false, true, true],
    [true, true, false, true, true],
    [false, true, false, true, false],
  ],
  E: [
    [true, true, true, true, true],
    [true, false, false, false, false],
    [true, false, false, false, false],
    [true, true, true, true, false],
    [true, false, false, false, false],
    [true, false, false, false, false],
    [true, true, true, true, true],
  ],
  B: [
    [true, true, true, true, false],
    [true, false, false, false, true],
    [true, false, false, false, true],
    [true, true, true, true, false],
    [true, false, false, false, true],
    [true, false, false, false, true],
    [true, true, true, true, false],
  ],
  N: [
    [true, false, false, false, true],
    [true, true, false, false, true],
    [true, true, false, false, true],
    [true, false, true, false, true],
    [true, false, false, true, true],
    [true, false, false, true, true],
    [true, false, false, false, true],
  ],
  T: [
    [true, true, true, true, true],
    [false, false, true, false, false],
    [false, false, true, false, false],
    [false, false, true, false, false],
    [false, false, true, false, false],
    [false, false, true, false, false],
    [false, false, true, false, false],
  ],
  I: [
    [true, true, true, true, true],
    [false, false, true, false, false],
    [false, false, true, false, false],
    [false, false, true, false, false],
    [false, false, true, false, false],
    [false, false, true, false, false],
    [true, true, true, true, true],
  ],
  C: [
    [false, true, true, true, false],
    [true, false, false, false, true],
    [true, false, false, false, false],
    [true, false, false, false, false],
    [true, false, false, false, false],
    [true, false, false, false, true],
    [false, true, true, true, false],
  ],
}

function PixelText({ text, className }: { text: string; className?: string }) {
  const letters = useMemo(() => text.split(''), [text])

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      {letters.map((char, i) => {
        const def = FONT[char]
        if (!def) return null
        return (
          <div key={i} className="grid" style={{ gridTemplateRows: `repeat(${def.length}, 1fr)` }}>
            {def.map((row, r) => (
              <div key={r} className="flex" style={{ gap: '1px' }}>
                {row.map((pixel, c) => (
                  <div
                    key={c}
                    className={cn(
                      'transition-colors',
                      pixel ? 'bg-foreground' : 'bg-transparent'
                    )}
                    style={{ width: 'clamp(4px, 1.2vw, 10px)', height: 'clamp(4px, 1.2vw, 10px)' }}
                  />
                ))}
              </div>
            ))}
          </div>
        )
      })}
    </div>
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
  const [activeMode, setActiveMode] = useState<string | null>(null)

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl mx-auto">
        <PixelText text="WEBENTIC" className="mb-6" />

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
      </div>
    </div>
  )
}
