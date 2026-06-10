'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight,
  ExternalLink,
  Github,
  Moon,
  Sun,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { InputGroup, InputGroupInput } from 'ui'

const packages = [
  {
    name: 'ui',
    desc: 'Shadcn/ui-based component library with custom extensions',
    href: 'https://github.com/mmdj04/Webentic/tree/main/packages/ui',
  },
  {
    name: 'ui-patterns',
    desc: 'Higher-level UI patterns and composed components',
    href: 'https://github.com/mmdj04/Webentic/tree/main/packages/ui-patterns',
  },
  {
    name: 'icons',
    desc: 'Custom SVG icon set for Webentic',
    href: 'https://github.com/mmdj04/Webentic/tree/main/packages/icons',
  },
  {
    name: 'common',
    desc: 'Shared utilities, providers, and helpers',
    href: 'https://github.com/mmdj04/Webentic/tree/main/packages/common',
  },
  {
    name: 'api-types',
    desc: 'TypeScript type definitions for the API',
    href: 'https://github.com/mmdj04/Webentic/tree/main/packages/api-types',
  },
  {
    name: 'config',
    desc: 'Shared configuration presets',
    href: 'https://github.com/mmdj04/Webentic/tree/main/packages/config',
  },
]

export default function DocsPage() {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-muted bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              WEBENTIC
            </Link>
            <nav className="hidden items-center gap-4 sm:flex">
              <Link
                href="/docs"
                className="text-sm font-medium text-foreground underline underline-offset-4"
              >
                Docs
              </Link>
              <Link
                href="/search"
                className="text-sm text-foreground-lighter transition-colors hover:text-foreground"
              >
                Search
              </Link>
              <Link
                href="/settings"
                className="text-sm text-foreground-lighter transition-colors hover:text-foreground"
              >
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex size-8 items-center justify-center rounded-full text-foreground-lighter transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>
            <a
              href="https://github.com/mmdj04/Webentic"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 items-center justify-center rounded-full text-foreground-lighter transition-colors hover:bg-muted hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="size-4" />
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="border-b border-muted">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-foreground">Webentic</span>{' '}
            <span className="text-foreground-muted">Open-Source</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-foreground-light sm:text-xl">
            A modern UI component library, design system, and open-source
            toolkit for building consistent, accessible web applications.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#getting-started"
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Get Started <ChevronRight className="size-4" />
            </Link>
            <a
              href="https://github.com/mmdj04/Webentic"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              GitHub <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Summary / Code Example ── */}
      <section className="border-b border-muted">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Fast. Smart. Open-Source.
              </h2>
              <p className="mt-3 text-foreground-light">
                Import components from packages or search the open-source
                registry. No build configuration needed.
              </p>
              <div className="mt-6 rounded-lg border border-muted bg-muted/30 p-4 font-mono text-sm">
                <pre className="overflow-x-auto">
                  <code>
                    <span className="text-foreground-muted">import </span>
                    <span className="text-foreground">{'{ Button }'}</span>
                    <span className="text-foreground-muted"> from </span>
                    <span className="text-brand">'ui'</span>
                  </code>
                </pre>
                <pre className="mt-2 overflow-x-auto">
                  <code>
                    <span className="text-foreground-muted">import </span>
                    <span className="text-foreground">{'{ Card }'}</span>
                    <span className="text-foreground-muted"> from </span>
                    <span className="text-brand">'ui'</span>
                  </code>
                </pre>
                <pre className="mt-2 overflow-x-auto">
                  <code>
                    <span className="text-foreground-muted">import </span>
                    <span className="text-foreground">{'{ ThemeProvider }'}</span>
                    <span className="text-foreground-muted"> from </span>
                    <span className="text-brand">'common'</span>
                  </code>
                </pre>
              </div>
            </div>

            {/* Package overview cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {packages.map((pkg) => (
                <a
                  key={pkg.name}
                  href={pkg.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg border border-muted p-4 transition-colors hover:border-foreground-muted hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-sm font-medium text-foreground">
                      {pkg.name}
                    </h3>
                    <ExternalLink className="size-3.5 text-foreground-muted opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="mt-1 text-xs text-foreground-light">
                    {pkg.desc}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Getting Started ── */}
      <section id="getting-started" className="border-b border-muted">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">Getting Started</h2>
          <p className="mt-2 text-foreground-light">
            Install the packages you need via pnpm.
          </p>

          <div className="mt-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold">Installation</h3>
              <div className="mt-3 rounded-lg border border-muted bg-muted/30 p-4 font-mono text-sm">
                <pre>
                  <code>
                    <span className="text-foreground-muted">
                      pnpm add ui
                    </span>
                  </code>
                </pre>
                <pre className="mt-2">
                  <code>
                    <span className="text-foreground-muted">
                      pnpm add ui-patterns
                    </span>
                  </code>
                </pre>
                <pre className="mt-2">
                  <code>
                    <span className="text-foreground-muted">
                      pnpm add icons
                    </span>
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Setup Providers</h3>
              <p className="mt-1 text-sm text-foreground-light">
                Wrap your app with the required providers.
              </p>
              <div className="mt-3 rounded-lg border border-muted bg-muted/30 p-4 font-mono text-sm">
                <pre>
                  <code>
                    <span className="text-foreground-muted">import </span>
                    <span className="text-foreground">
                      {'{ ThemeProvider }'}
                    </span>
                    <span className="text-foreground-muted"> from </span>
                    <span className="text-brand">'common'</span>
                  </code>
                </pre>
                <pre>
                  <code>
                    <span className="text-foreground-muted">import </span>
                    <span className="text-foreground">
                      {'{ TooltipProvider }'}
                    </span>
                    <span className="text-foreground-muted"> from </span>
                    <span className="text-brand">'ui'</span>
                  </code>
                </pre>
                <pre className="mt-2 text-foreground-muted">{'// ...'}</pre>
                <pre>
                  <code>
                    <span className="text-foreground-muted">{'<'}</span>
                    <span className="text-foreground">ThemeProvider</span>
                    <span className="text-foreground-muted">{'>'}</span>
                  </code>
                </pre>
                <pre>
                  <code>
                    <span className="text-foreground-muted">{'  <'}</span>
                    <span className="text-foreground">TooltipProvider</span>
                    <span className="text-foreground-muted">{'>'}</span>
                  </code>
                </pre>
                <pre>
                  <code>
                    <span className="text-foreground-muted">
                      {'    '}
                    </span>
                    <span className="text-foreground-light">
                      {'{children}'}
                    </span>
                  </code>
                </pre>
                <pre>
                  <code>
                    <span className="text-foreground-muted">{'  </'}</span>
                    <span className="text-foreground">TooltipProvider</span>
                    <span className="text-foreground-muted">{'>'}</span>
                  </code>
                </pre>
                <pre>
                  <code>
                    <span className="text-foreground-muted">{'</'}</span>
                    <span className="text-foreground">ThemeProvider</span>
                    <span className="text-foreground-muted">{'>'}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Components ── */}
      <section id="components" className="border-b border-muted">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">Components</h2>
          <p className="mt-2 text-foreground-light">
            Webentic ships two layers of components.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-muted p-6">
              <h3 className="font-semibold text-foreground">ui (shadcn)</h3>
              <p className="mt-1 text-sm text-foreground-light">
                50+ primitive components built on Radix UI: Button, Dialog,
                Dropdown, Form, Input, Select, Table, Tabs, Toast, and more.
              </p>
            </div>
            <div className="rounded-lg border border-muted p-6">
              <h3 className="font-semibold text-foreground">ui-patterns</h3>
              <p className="mt-1 text-sm text-foreground-light">
                Higher-level composed patterns: FilterBar, Table, TOC,
                AssistantChat, Banners, PromoToast, MobileSheetNav, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search ── */}
      <section id="search" className="border-b border-muted">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Search Open-Source Registry
          </h2>
          <p className="mt-2 text-foreground-light">
            Search across the entire open-source ecosystem for packages and
            components.
          </p>

          <form onSubmit={handleSearch} className="mt-6 max-w-md">
            <InputGroup className="w-full">
              <InputGroupInput
                placeholder="Search packages..."
                className="font-mono text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
          </form>

          <div className="mt-4 text-sm text-foreground-light">
            <Link
              href="/search?q=react"
              className="text-foreground underline underline-offset-2 hover:text-foreground-light"
            >
              react
            </Link>
            <span className="mx-2 text-foreground-muted">·</span>
            <Link
              href="/search?q=tailwind"
              className="text-foreground underline underline-offset-2 hover:text-foreground-light"
            >
              tailwind
            </Link>
            <span className="mx-2 text-foreground-muted">·</span>
            <Link
              href="/search?q=typescript"
              className="text-foreground underline underline-offset-2 hover:text-foreground-light"
            >
              typescript
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-muted">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-foreground-muted">
              Webentic Open-Source &mdash; MIT License
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-xs text-foreground-muted transition-colors hover:text-foreground"
              >
                Home
              </Link>
              <Link
                href="/search"
                className="text-xs text-foreground-muted transition-colors hover:text-foreground"
              >
                Search
              </Link>
              <Link
                href="/settings"
                className="text-xs text-foreground-muted transition-colors hover:text-foreground"
              >
                Settings
              </Link>
              <a
                href="https://github.com/mmdj04/Webentic"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-foreground-muted transition-colors hover:text-foreground"
              >
                <Github className="size-3" /> GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
