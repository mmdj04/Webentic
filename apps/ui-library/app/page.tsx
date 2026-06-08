'use client'

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

const ROWS = 7
const COLS = 5
const PX = 8
const GAP = 1
const LETTER_GAP = 5

function PixelText({ className }: { className?: string }) {
  const letters = 'WEBENTIC'.split('')

  const letterWidth = COLS * PX + (COLS - 1) * GAP
  const svgWidth = letters.reduce((w, _, i) => w + (i > 0 ? LETTER_GAP : 0) + letterWidth, 0)
  const svgHeight = ROWS * PX + (ROWS - 1) * GAP

  let cursor = 0

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className={cn('text-foreground shrink-0 w-full', className)}
      fill="currentColor"
    >
      {letters.map((char, li) => {
        const def = FONT[char]
        if (!def) return null
        const x = cursor
        cursor += letterWidth + LETTER_GAP
        return (
          <g key={li}>
            {def.map((row, r) =>
              row.map((pixel, c) =>
                pixel ? (
                  <rect
                    key={`${r}-${c}`}
                    x={x + c * (PX + GAP)}
                    y={r * (PX + GAP)}
                    width={PX}
                    height={PX}
                    rx={1}
                  />
                ) : null
              )
            )}
          </g>
        )
      })}
    </svg>
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
    href: 'https://supabase-design-system-kohl.vercel.app/design-system',
  },
] as const

export default function HomePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <PixelText className="mb-6" />

        <div className="relative rounded-xl border border-muted bg-surface-75 shadow-sm overflow-hidden w-full">
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
            <Textarea
              placeholder="Type a message..."
              className="min-h-[100px] font-mono text-sm resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
