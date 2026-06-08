'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'ui'

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

  const activeHref = activeMode
    ? MODES.find((m) => m.id === activeMode)!.href
    : '#'

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-1 mb-10">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={[
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                activeMode === mode.id
                  ? 'text-foreground bg-muted'
                  : 'text-foreground-muted hover:text-foreground',
              ].join(' ')}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <h1 className="text-center font-bold tracking-tight select-none mb-14 leading-none">
          <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-foreground uppercase">
            WEBENTIC
          </span>
          <br />
          <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-foreground uppercase">
            <span className="text-foreground-muted">OPEN</span>-SOURCE
          </span>
        </h1>

        <InputGroup className="w-full">
          <InputGroupAddon align="inline-start">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="flex items-center justify-center size-8 rounded-md text-foreground-muted hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Select destination"
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
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start" side="bottom">
                {MODES.map((mode) => (
                  <Link
                    key={mode.id}
                    href={mode.href}
                    className={[
                      'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
                      activeMode === mode.id
                        ? 'text-foreground bg-muted font-medium'
                        : 'text-foreground-light hover:text-foreground hover:bg-muted',
                    ].join(' ')}
                    onClick={() => setActiveMode(mode.id)}
                  >
                    {mode.label}
                    <ArrowUpRight className="size-3 ml-auto text-foreground-muted" />
                  </Link>
                ))}
              </PopoverContent_Shadcn_>
            </Popover_Shadcn_>
          </InputGroupAddon>

          <InputGroupInput
            placeholder="Type a message..."
            className="font-mono text-sm"
          />

          <InputGroupAddon align="inline-end">
            <Link href={activeHref}>
              <InputGroupButton
                size="tiny"
                disabled={!activeMode}
                className={activeMode ? '' : 'opacity-50 cursor-not-allowed'}
                aria-label="Go"
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
              </InputGroupButton>
            </Link>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  )
}
