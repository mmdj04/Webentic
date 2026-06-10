'use client'

import { Github } from 'lucide-react'
import Link from 'next/link'

export default function DocsPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <style>{`
        .doc-page .wrapper { width: 90%; max-width: 800px; }
        .doc-page .wrapper>h2 { position: relative; padding: 120px 0 0; text-align: center; }
        .doc-page .wrapper>h2 strong { font-size: 32px; font-weight: 700; line-height: 1; }
        .doc-page .wrapper>h3 { text-align: center; line-height: 1; font-size: 18px; font-weight: 400; padding: 8px 0 80px; color: #888; }
        .markdown-body p { margin-top: 1.27rem; line-height: 1.5; }
        .markdown-body h3 { margin-top: 2.7em; font-size: 1.35rem; font-weight: 500; line-height: 1.27; }
        .markdown-body h3:first-child { margin-top: 0; }
        .markdown-body pre { box-sizing: border-box; overflow-x: auto; width: 100%; margin-top: 1.27rem; border-radius: 6px; line-height: 1.6; font-size: 90%; background: #272931; white-space: pre; -webkit-overflow-scrolling: touch; }
        .markdown-body pre>code { display: block; padding: 1rem !important; }
        .markdown-body :not(pre)>code { display: inline; white-space: pre-wrap; }
        .markdown-body strong { font-weight: 600; }
        .markdown-body a { box-shadow: 0 1px 0 0 currentColor; }
        .markdown-body a:hover { box-shadow: none; }
        .markdown-body blockquote { border-left: 2px solid #888; padding: 0 1.2rem; margin: 1.5rem 0; }
        .markdown-body ul { list-style-type: disc; padding-left: 1.6rem; margin-top: 1.27rem; }
        .markdown-body li { margin-top: 0.6rem; }
      `}</style>

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 z-50 w-screen bg-background/95 backdrop-blur-md" style={{ height: 100 }}>
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4" style={{ width: '90%' }}>
          <h1 className="flex items-center text-2xl font-bold cursor-pointer">
            <Link href="/">WEBENTIC</Link>
          </h1>
          <nav className="flex items-center gap-9">
            <Link href="#docs" className="text-sm text-foreground-lighter hover:text-foreground transition-colors">Docs</Link>
            <Link href="#search" className="text-sm text-foreground-lighter hover:text-foreground transition-colors">Search</Link>
            <Link href="#faq" className="text-sm text-foreground-lighter hover:text-foreground transition-colors">FAQ</Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-5 rounded-lg h-9 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              Search
            </Link>
            <a
              href="https://github.com/mmdj04/Webentic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground-lighter hover:text-foreground transition-colors"
            >
              <Github className="size-6" />
            </a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section id="hero" className="flex flex-col items-center justify-center w-full" style={{ height: '100vh', minHeight: 680 }}>
        <h2 className="flex flex-col items-center" style={{ paddingTop: 60 }}>
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase text-foreground leading-none">
            Documentation
          </span>
        </h2>
      </section>

      {/* ── Summary ── */}
      <section id="summary">
        <div className="mx-auto flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl px-4" style={{ paddingBottom: 100 }}>
          {/* Card */}
          <div className="relative flex flex-col items-start justify-between min-w-[300px] aspect-[3/4] p-9 rounded-[20px] border-2 border-foreground-muted/30 bg-background">
            <svg width="20" height="20" viewBox="0 0 16 16" className="text-foreground-lighter" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M0 5.25143C0 4.3552 0.356318 3.58403 1.06897 2.93791C1.75863 2.31263 2.62069 2 3.65517 2C4.71265 2 5.5862 2.31263 6.27586 2.93791L7.34483 3.87582C7.41379 3.93835 7.41379 4.00088 7.34483 4.06341L6.65517 4.65742C6.58621 4.71994 6.52874 4.71994 6.48276 4.65742L5.41379 3.7195C4.90804 3.30265 4.32184 3.09423 3.65517 3.09423C3.01149 3.09423 2.43678 3.30265 1.93104 3.7195C1.47126 4.13636 1.24138 4.64699 1.24138 5.25143C1.24138 5.85586 1.47126 6.3665 1.93104 6.78335C2.43678 7.2002 3.01149 7.40862 3.65517 7.40862C4.32184 7.40862 4.90804 7.2002 5.41379 6.78335L9.72414 2.93791C10.4138 2.31263 11.2874 2 12.3448 2C13.3793 2 14.2414 2.31263 14.931 2.93791C15.6437 3.58403 16 4.3552 16 5.25143C16 6.14766 15.6437 6.91882 14.931 7.56494C14.7464 7.73238 14.5493 7.8774 14.3399 8C14.5493 8.1226 14.7464 8.26762 14.931 8.43506C15.6437 9.08118 16 9.85234 16 10.7486C16 11.6448 15.6437 12.416 14.931 13.0621C14.2414 13.6874 13.3793 14 12.3448 14C11.2874 14 10.4138 13.6874 9.72414 13.0621L8.65517 12.1242C8.58621 12.0616 8.58621 11.9991 8.65517 11.9366L9.34483 11.3426C9.41379 11.2801 9.47126 11.2801 9.51724 11.3426L10.5862 12.2805C11.092 12.6973 11.6782 12.9058 12.3448 12.9058C12.9885 12.9058 13.5632 12.6973 14.069 12.2805C14.5517 11.8428 14.7931 11.3322 14.7931 10.7486C14.7931 10.165 14.5517 9.65435 14.069 9.21665C13.5632 8.7998 12.9885 8.59138 12.3448 8.59138C11.6782 8.59138 11.092 8.7998 10.5862 9.21665L6.27586 13.0621C5.5862 13.6874 4.72414 14 3.68966 14C2.65517 14 1.79311 13.6874 1.10345 13.0621C0.367812 12.3951 0 11.624 0 10.7486C0 9.85234 0.356318 9.08118 1.06897 8.43506C1.25874 8.263 1.46157 8.11462 1.67745 7.98991C1.47442 7.86946 1.28309 7.72781 1.10345 7.56494C0.367814 6.89798 0 6.12681 0 5.25143Z" fill="currentColor" />
            </svg>
            <div className="flex flex-col gap-2 text-xl font-medium leading-tight text-foreground-muted">
              <div>over</div>
              <div className="text-4xl sm:text-[38px] font-bold text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
                7
              </div>
              <div>packages available</div>
            </div>
          </div>

          {/* Blabla */}
          <div className="flex-1 max-w-[620px]">
            <h3 className="text-2xl sm:text-3xl font-semibold leading-tight">
              Build modern web apps with accessible, performant components.
            </h3>

          </div>
        </div>
      </section>

      {/* ── Docs ── */}
      <section className="doc-page" id="docs">
        <div className="wrapper">
          <h2><strong>How to Use</strong></h2>
          <h3>Get started with Webentic components.</h3>

          <div className="markdown-body text-foreground-lighter">
            <p>
              Webentic allows you to import UI components from our packages,{' '}
              <strong>no complex build configuration needed.</strong>
            </p>

            <pre><code><span className="text-foreground-muted">import</span> {'{ Button }'} <span className="text-foreground-muted">from</span> <span className="text-foreground">{'"ui"'}</span>
<span className="text-foreground-muted">import</span> {'{ Card, Input }'} <span className="text-foreground-muted">from</span> <span className="text-foreground">{'"ui"'}</span>
<span className="text-foreground-muted">import</span> {'{ FilterBar }'} <span className="text-foreground-muted">from</span> <span className="text-foreground">{'"ui-patterns"'}</span></code></pre>

            <h3 id="installation">Installation</h3>
            <p>
              Install the packages you need via <strong>pnpm</strong>.
            </p>

            <pre><code><span className="text-foreground-muted">pnpm add</span> ui
<span className="text-foreground-muted">pnpm add</span> ui-patterns
<span className="text-foreground-muted">pnpm add</span> icons</code></pre>

            <h3 id="available-packages">Available Packages</h3>
            <p>
              Webentic ships the following packages:
            </p>

            <ul>
              <li>
                <strong>ui</strong> — Shadcn/ui-based library with 50+ Radix primitives: Button, Dialog, Dropdown, Form, Input, Select, Table, Tabs, Toast, and more.
              </li>
              <li>
                <strong>ui-patterns</strong> — Higher-level composed patterns: FilterBar, Table, TOC, AssistantChat, Banners, PromoToast, Form layouts, CommandMenu, and more.
              </li>
              <li>
                <strong>icons</strong> — Custom SVG icon set for Webentic (Auth, Database, Realtime, Storage, and more).
              </li>
              <li>
                <strong>common</strong> — Shared utilities, hooks, providers (ThemeProvider, AuthProvider, feature flags, telemetry, and more).
              </li>
              <li>
                <strong>api-types</strong> — TypeScript type definitions.
              </li>
              <li>
                <strong>config</strong> — Shared Tailwind/postCSS configuration presets.
              </li>
            </ul>

            <h3 id="setup-providers">Setup Providers</h3>
            <p>
              Wrap your application root with the required providers:
            </p>

            <pre><code><span className="text-foreground-muted">import</span> {'{ ThemeProvider }'} <span className="text-foreground-muted">from</span> <span className="text-foreground">{'"common"'}</span>
<span className="text-foreground-muted">import</span> {'{ TooltipProvider }'} <span className="text-foreground-muted">from</span> <span className="text-foreground">{'"ui"'}</span>

{'<ThemeProvider>'}
{'  <TooltipProvider>'}
{'    {children}'}
{'  </TooltipProvider>'}
{'</ThemeProvider>'}</code></pre>

            <h3 id="search">Search Open-Source Registry</h3>
            <p>
              Search across the open-source ecosystem for packages and components. Visit{' '}
              <a href="/search">/search?q=...</a> to find what you need.
            </p>

            <pre><code><span className="text-foreground-muted">// Example search URLs</span>
<a href="/search?q=react">/search?q=react</a>
<a href="/search?q=tailwind">/search?q=tailwind</a>
<a href="/search?q=typescript">/search?q=typescript</a></code></pre>

            <h3 id="theming">Theming</h3>
            <p>
              Webentic supports dark and light modes out of the box via <strong>next-themes</strong>.
              The ThemeProvider from <strong>common</strong> wraps the next-themes provider with
              Webentic-specific theme configuration.
            </p>

            <p>
              You can toggle themes using the Sun/Moon button available in the top-right corner
              of the header.
            </p>

            <h3 id="using-import-maps">Using Import Maps</h3>
            <p>
              With import maps, you can use bare import specifiers instead of full package paths.
            </p>

            <pre><code>{'<script type="importmap">'}
{'  "imports": {'}
{'    "ui": "https://esm.sh/ui",'}
{'    "icons": "https://esm.sh/icons"'}
{'  }'}
{'</script>'}

{'<script type="module">'}
{'  import { Button } from "ui"'}
{'  import { Database } from "icons"'}
{'</script>'}</code></pre>

            <h3 id="components">Components</h3>
            <p>
              Webentic ships two layers of components designed to work together.
            </p>

            <p>
              <strong>ui (shadcn)</strong> provides 50+ primitive components built on Radix UI.
              These are unstyled, accessible, and fully customizable via Tailwind. Includes:
              accordion, alert, avatar, badge, button, calendar, card, chart, checkbox, collapsible,
              command, dialog, drawer, dropdown, form, hover-card, input, menubar, navigation-menu,
              popover, progress, radio-group, resizable, scroll-area, select, separator, sheet,
              sidebar, skeleton, slider, switch, table, tabs, textarea, toggle, tooltip, and more.
            </p>

            <p>
              <strong>ui-patterns</strong> provides higher-level composed patterns ready to use:
              AssistantChat, Banners, Chart, CodeBlock, CommandMenu, ComplexTabs, ErrorDisplay,
              FilterBar, Form layouts, GlassPanel, McpUrlBuilder, PageHeader, PromoToast,
              ShimmeringLoader, Table (with sorting), Toc, TweetCard, and more.
            </p>

            <h3 id="tree-shaking">Tree Shaking</h3>
            <p>
              Both <strong>ui</strong> and <strong>ui-patterns</strong> support tree shaking.
              Import only the components you need and your bundler will eliminate unused code.
            </p>

            <pre><code><span className="text-foreground-muted">// Instead of importing everything:</span>
<span className="text-foreground-muted">import</span> {'{ Button, Card, Input, Select, Table }'} <span className="text-foreground-muted">from</span> <span className="text-foreground">{'"ui"'}</span></code></pre>

            <h3 id="development">Development Build</h3>

            <pre><code><span className="text-foreground-muted">import</span> {'{ Button }'} <span className="text-foreground-muted">from</span> <span className="text-foreground">{'"ui/dev"'}</span></code></pre>

            <p>
              The development build includes additional warnings and error messages to help
              you debug during development.
            </p>

            <h3 id="typescript">TypeScript Support</h3>
            <p>
              All packages ship with full TypeScript definitions. API types are available
              in the <strong>api-types</strong> package.
            </p>

            <pre><code><span className="text-foreground-muted">import type</span> {'{ Database }'} <span className="text-foreground-muted">from</span> <span className="text-foreground">{'"api-types"'}</span>
<span className="text-foreground-muted">import type</span> {'{ ButtonProps }'} <span className="text-foreground-muted">from</span> <span className="text-foreground">{'"ui"'}</span></code></pre>

            <h3 id="github">GitHub</h3>
            <p>
              Webentic is an open-source project. Find the source code and contribute on{' '}
              <a href="https://github.com/mmdj04/Webentic" target="_blank" rel="noopener noreferrer">GitHub</a>.
            </p>

          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="doc-page">
        <div className="wrapper" style={{ paddingBottom: 100 }}>
          <h2><strong>FAQs</strong></h2>
          <h3>Frequently asked questions.</h3>

          <div className="markdown-body text-foreground-lighter">
            <p><strong>Which frameworks are supported?</strong></p>
            <p>Webentic works with any React framework — Next.js, Remix, Vite, or plain React. The components are framework-agnostic.</p>

            <p><strong>Do I need to install anything besides the packages?</strong></p>
            <p>Yes, you need <strong>pnpm</strong> (9+) and a React 18+ project. The packages use Tailwind CSS v4 for styling.</p>

            <p><strong>Can I use individual components without installing the whole package?</strong></p>
            <p>Yes, Webentic supports tree shaking. Your bundler will only include the components you import. You can also copy individual component source files from the <a href="https://github.com/mmdj04/Webentic" target="_blank" rel="noopener noreferrer">GitHub repository</a>.</p>

            <p><strong>Does Webentic support server-side rendering?</strong></p>
            <p>Yes, all components support SSR out of the box. The library is designed to work with Next.js App Router and React Server Components.</p>

            <p><strong>How can I report a bug?</strong></p>
            <p>Please open an issue on <a href="https://github.com/mmdj04/Webentic/issues" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>

            <p><strong>Is Webentic free to use?</strong></p>
            <p>Yes, Webentic is open-source under the MIT License. You can use it for personal and commercial projects.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '140px 0 50px' }}>
        <div className="flex flex-col items-center">
          <div className="w-[30px] h-px bg-foreground-muted mb-2" />
          <p className="text-foreground-muted text-center text-sm">
            Webentic Open-Source &mdash; MIT License
          </p>
          <p className="text-foreground-muted text-center text-sm mt-2">
            Built with React, Next.js, Tailwind CSS, and Radix UI.
          </p>
        </div>
      </footer>
    </div>
  )
}
