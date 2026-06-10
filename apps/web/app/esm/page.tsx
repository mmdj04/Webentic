'use client'

import Link from 'next/link'
import { Github, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { CodeBlock } from 'ui'

const NAV_ITEMS = [
  { label: 'Docs', href: '#docs' },
  { label: 'TSX', href: '#tsx' },
  { label: 'FAQ', href: '#faq' },
]

export default function EsmPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, Inter, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif' }}>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center backdrop-blur-sm" style={{ height: 100, backgroundColor: 'color-mix(in srgb, var(--background-default) 95%, transparent)' }}>
        <div className="w-full flex items-center justify-between" style={{ maxWidth: 1152, margin: '0 auto', padding: '0 24px' }}>
          <Link href="/esm" className="flex items-center gap-2 no-underline">
            <span className="text-2xl font-bold" style={{ color: 'var(--foreground-default)' }}>Webentic</span>
          </Link>
          <div className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="no-underline text-sm hover-underline"
                style={{ color: 'var(--foreground-light)' }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="https://github.com/esm-dev/esm.sh"
              className="flex items-center"
            >
              <Github className="size-5" style={{ color: 'var(--foreground-light)' }} />
            </Link>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="bg-transparent border-none cursor-pointer flex items-center justify-center p-1.5 rounded-lg"
              style={{ color: 'var(--foreground-light)' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      <div style={{ paddingTop: 100 }}>
        <section className="flex flex-col justify-center items-center w-full" style={{ minHeight: 600, padding: '80px 24px 40px', textAlign: 'center' }}>
          <h2 className="pt-[60px] text-center">
            <strong className="text-[52px] sm:text-[72px] md:text-[105px] leading-none font-bold text-foreground uppercase">
              Webentic
            </strong>
            <br />
            <strong className="text-[52px] sm:text-[72px] md:text-[105px] leading-none font-bold text-foreground uppercase">
              <em className="not-italic text-foreground-muted">Open</em>-Source
            </strong>
          </h2>

          <div className="flex items-center justify-center gap-2 mt-12 mb-4">
            <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Fast</span>
            <span className="text-sm" style={{ color: 'var(--foreground-default)' }}>Smart</span>
            <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Global</span>
            <span className="text-sm" style={{ color: 'var(--foreground-light)' }}>ESM&gt;CDN</span>
          </div>

          <div className="font-semibold leading-tight mx-auto" style={{ fontSize: 32, marginBottom: 8, maxWidth: 640, color: 'var(--foreground-default)' }}>
            Create modern (es2015+) web apps easily with NPM packages in browser/Deno.
          </div>
          <div className="text-lg mb-6" style={{ color: 'var(--foreground-muted)' }}>
            No build tools needed!
          </div>

          <div className="inline-flex justify-center mb-4">
            <CodeBlock
              language="js"
              className="language-js"
              value={`import confetti from "https://esm.sh/canvas-confetti@1.6.0"`}
            />
          </div>

          <div className="text-center">
            <button
              className="bg-transparent border-none rounded-lg cursor-pointer font-normal"
              style={{
                color: 'var(--foreground-default)',
                padding: '8px 24px',
                fontSize: 14,
              }}
            >
              Import &amp; Run &rarr;
            </button>
          </div>
        </section>

        <section id="docs" style={{ borderTop: '1px solid var(--border-default)', maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
          <div className="text-sm mb-2" style={{ color: 'var(--foreground-muted)' }}>How to Use</div>
          <div className="text-lg mb-8" style={{ color: 'var(--foreground-muted)' }}>
            Get started with JavaScript module syntax.
          </div>

          <div className="text-sm leading-relaxed mb-8" style={{ color: 'var(--foreground-light)' }}>
            esm.sh allows you to import{' '}
            <Link href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules" className="no-underline" style={{ color: 'var(--brand-default)' }}>
              JavaScript modules
            </Link>{' '}
            from http URLs, <strong style={{ color: 'var(--foreground-default)' }}>no installation/build steps needed</strong>.
          </div>

          <CodeBlock
            language="js"
            className="language-js"
            value={`import * as mod from "https://esm.sh/PKG[@SEMVER][/PATH]";`}
          />

          <div className="text-sm leading-relaxed mb-4 mt-6" style={{ color: 'var(--foreground-light)' }}>
            With{' '}
            <Link href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap" className="no-underline" style={{ color: 'var(--brand-default)' }}>
              import maps
            </Link>
            , you can even use bare import specifiers instead of URLs:
          </div>

          <CodeBlock
            language="html"
            className="language-html"
            value={`<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@19.2.0",
    "react-dom/": "https://esm.sh/react-dom@19.2.0/"
  }
}
</script>
<script type="module">
import React from "react";
import { render } from "react-dom/client";
</script>`}
          />

          <div className="text-lg font-medium mb-4 mt-8" style={{ color: 'var(--foreground-default)' }}>Supported Registries</div>

          <div className="mb-3">
            <strong className="text-sm" style={{ color: 'var(--foreground-default)' }}>NPM</strong>
            <div className="mt-2">
              <CodeBlock
                language="js"
                className="language-js"
                value={`import React from "https://esm.sh/react";
import React from "https://esm.sh/react@18";
import { renderToString } from "https://esm.sh/react-dom/server";`}
              />
            </div>
          </div>

          <div className="mb-3">
            <strong className="text-sm" style={{ color: 'var(--foreground-default)' }}>JSR <span style={{ color: 'var(--brand-default)' }}>(starts with `/jsr/`)</span></strong>
            <div className="mt-2">
              <CodeBlock
                language="js"
                className="language-js"
                value={`import { encodeBase64 } from "https://esm.sh/jsr/@std/encoding@1.0.0/base64";
import { Hono } from "https://esm.sh/jsr/@hono/hono@4";`}
              />
            </div>
          </div>

          <div className="mb-3">
            <strong className="text-sm" style={{ color: 'var(--foreground-default)' }}>GitHub <span style={{ color: 'var(--brand-default)' }}>(starts with `/gh/`)</span></strong>
            <div className="mt-2">
              <CodeBlock
                language="js"
                className="language-js"
                value={`import tslib from "https://esm.sh/gh/microsoft/tslib";
import tslib from "https://esm.sh/gh/microsoft/tslib@v2.8.0";`}
              />
            </div>
          </div>
        </section>

        <section id="tsx" style={{ borderTop: '1px solid var(--border-default)', maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
          <div className="text-base mb-2">
            Using <span style={{ color: 'var(--brand-default)' }}>esm.sh/tsx</span>
          </div>
          <div className="text-lg mb-8" style={{ color: 'var(--foreground-muted)' }}>
            TSX just works in browsers.
          </div>

          <div className="text-sm leading-relaxed mb-6" style={{ color: 'var(--foreground-light)' }}>
            <span style={{ color: 'var(--brand-default)' }}>esm.sh/tsx</span> is a lightweight{' '}
            <strong style={{ color: 'var(--foreground-default)' }}>1KB</strong> script that allows you to write{' '}
            <strong style={{ color: 'var(--foreground-default)' }}>TSX</strong> directly in HTML without any build steps.
          </div>

          <CodeBlock
            language="html"
            className="language-html"
            value={`<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@19.2.0",
      "react-dom/client": "https://esm.sh/react-dom@19.2.0/client"
    }
  }
  </script>
  <script type="module" src="https://esm.sh/tsx"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    import { createRoot } from "react-dom/client"
    createRoot(root).render(<h1>Hello, World!</h1>)
  </script>
</body>
</html>`}
          />
        </section>

        <section id="faq" style={{ borderTop: '1px solid var(--border-default)', maxWidth: 960, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div className="text-base mb-2" style={{ color: 'var(--foreground-default)' }}>FAQs</div>
          <div className="text-lg mb-8" style={{ color: 'var(--foreground-muted)' }}>
            Frequently asked questions.
          </div>

          <div className="text-left" style={{ maxWidth: 640, margin: '0 auto' }}>
            <div className="mb-6">
              <div className="font-semibold mb-2 text-sm" style={{ color: 'var(--foreground-default)' }}>
                Which browsers are supported?
              </div>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                esm.sh supports all modern browsers which support{' '}
                <Link href="https://caniuse.com/es6-module" className="no-underline" style={{ color: 'var(--brand-default)' }}>ES6 Module</Link>
                . Including{' '}
                <Link href="https://deno.land" className="no-underline" style={{ color: 'var(--brand-default)' }}>Deno</Link>.
              </div>
            </div>

            <div className="mb-6">
              <div className="font-semibold mb-2 text-sm" style={{ color: 'var(--foreground-default)' }}>
                Does esm.sh support private npm packages?
              </div>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                Nope, but you can deploy your own esm.sh server to support private npm packages.{' '}
                <Link href="https://github.com/esm-dev/esm.sh/blob/main/HOSTING.md" className="no-underline" style={{ color: 'var(--brand-default)' }}>Self hosting guide</Link>.
              </div>
            </div>

            <div className="mb-6">
              <div className="font-semibold mb-2 text-sm" style={{ color: 'var(--foreground-default)' }}>
                How can I report a bug?
              </div>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                Please open an issue on{' '}
                <Link href="https://github.com/esm-dev/esm.sh/issues/new/choose" className="no-underline" style={{ color: 'var(--brand-default)' }}>GitHub</Link>. Thanks :)
              </div>
            </div>
          </div>
        </section>

        <footer style={{ borderTop: '1px solid var(--border-default)', padding: '24px', textAlign: 'center' }}>
          <div className="flex justify-center gap-2 text-sm mx-auto" style={{ maxWidth: 1152, color: 'var(--foreground-muted)' }}>
            <span>
              esm.sh is an{' '}
              <Link href="https://github.com/esm-dev/esm.sh" className="no-underline" style={{ color: 'var(--foreground-light)' }}>
                open source
              </Link>{' '}
              project under MIT License.
            </span>
            <span style={{ color: 'var(--border-strong)' }}>|</span>
            <span>
              Powered by{' '}
              <Link href="https://cloudflare.com" className="no-underline" style={{ color: 'var(--foreground-light)' }}>
                Cloudflare
              </Link>.
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
