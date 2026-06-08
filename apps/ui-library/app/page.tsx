'use client'

import Link from 'next/link'
import { Textarea } from 'ui'

const ACTIONS = [
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
        <div className="relative rounded-xl border border-muted bg-surface-75 shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-muted">
            <span className="size-2.5 rounded-full bg-red-500" />
            <span className="size-2.5 rounded-full bg-amber-500" />
            <span className="size-2.5 rounded-full bg-green-500" />
            <span className="ml-2 text-xs font-mono text-foreground-light">
              Supabase UI — ~/projects
            </span>
          </div>
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-mono font-bold text-foreground tracking-tight">
                Supabase UI
              </h1>
              <p className="mt-2 text-sm text-foreground-light font-mono">
                Choose a workspace to get started
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Textarea
                  placeholder="Type a command or select an option below..."
                  className="min-h-[60px] font-mono text-sm resize-none pr-20"
                  rows={2}
                />
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <span className="inline-flex items-center rounded border border-muted bg-background px-2 py-1 text-[10px] font-mono text-foreground-light">
                    Tab
                  </span>
                  <span className="inline-flex items-center rounded border border-muted bg-background px-2 py-1 text-[10px] font-mono text-foreground-light">
                    ↵
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ACTIONS.map((action) => (
                  <Link
                    key={action.id}
                    href={action.href}
                    target={action.href.startsWith('http') ? '_blank' : undefined}
                    className="group relative overflow-hidden rounded-lg border border-muted bg-background p-4 transition-all hover:border-foreground-muted hover:bg-overlay/50 active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-medium text-foreground group-hover:text-foreground">
                        {action.label}
                      </span>
                      <svg
                        className="size-4 text-foreground-muted transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                    <p className="mt-1 text-xs text-foreground-light">
                      {action.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-[10px] font-mono text-foreground-muted">
              Select a workspace above or type a command to continue
            </p>
          </div>

          <div className="border-t border-muted px-4 py-2 flex items-center justify-between text-[10px] font-mono text-foreground-muted">
            <span>build</span>
            <span className="flex items-center gap-3">
              <span>Tab · switch mode</span>
              <span>Ctrl+Q · quit</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
