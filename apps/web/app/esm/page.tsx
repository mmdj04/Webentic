'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, Github } from 'lucide-react'
import { cn } from 'ui'

const NAV_ITEMS = [
  { label: 'Docs', href: '#docs' },
  { label: 'TSX', href: '#tsx' },
  { label: 'FAQ', href: '#faq' },
]

export default function EsmPage() {
  const [copied1, setCopied1] = useState(false)
  const [copied2, setCopied2] = useState(false)

  const copyCode = (code: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(code)
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  return (
    <div style={{ backgroundColor: '#202020', color: '#fefefe', minHeight: '100vh', fontFamily: 'ui-sans-serif, system-ui, -apple-system, Inter, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif' }}>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 100, backgroundColor: 'rgba(32, 32, 32, 0.95)', zIndex: 50, display: 'flex', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: 1152, width: '100%', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/esm" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="https://esm.sh/logo.svg" alt="ESM" style={{ height: 32 }} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{ color: '#ddd', textDecoration: 'none', fontSize: 14 }}
                className="hover-underline"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="https://github.com/esm-dev/esm.sh"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <Github className="size-5" style={{ color: '#ddd' }} />
            </Link>
            <button
              style={{
                backgroundColor: '#ddd',
                color: '#202020',
                border: 'none',
                borderRadius: 8,
                padding: '0 20px',
                height: 36,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Playground
            </button>
          </div>
        </div>
      </header>

      <div style={{ paddingTop: 100 }}>
        <section style={{ maxWidth: 1152, margin: '0 auto', padding: '80px 24px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: '#888' }}>Fast</span>
            <span style={{ fontSize: 14, color: '#fefefe' }}>Smart</span>
            <span style={{ fontSize: 14, color: '#888' }}>Global</span>
            <span style={{ fontSize: 14, color: '#ddd' }}>ESM&gt;CDN</span>
          </div>

          <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.2, marginBottom: 8, maxWidth: 640 }}>
            Create modern (es2015+) web apps easily with NPM packages in browser/Deno.
          </div>
          <div style={{ fontSize: 18, color: '#888', marginBottom: 24 }}>
            No build tools needed!
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#111',
              borderRadius: 8,
              padding: '18px 24px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: 14,
              marginBottom: 16,
              position: 'relative',
            }}
          >
            <span style={{ color: '#888' }}>import</span>
            <span style={{ color: '#fefefe' }}>confetti</span>
            <span style={{ color: '#888' }}>from</span>
            <span style={{ color: '#888' }}>&quot;</span>
            <span style={{ color: '#fefefe' }}>https://esm.sh/canvas-confetti@1.6.0</span>
            <span style={{ color: '#888' }}>&quot;</span>
            <button
              onClick={() => copyCode(`import confetti from "https://esm.sh/canvas-confetti@1.6.0"`, setCopied1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#888',
                padding: 4,
                marginLeft: 8,
                display: 'flex',
              }}
            >
              {copied1 ? <Check className="size-4" style={{ color: '#fefefe' }} /> : <Copy className="size-4" />}
            </button>
          </div>

          <div>
            <button
              style={{
                backgroundColor: 'transparent',
                color: '#fefefe',
                border: 'none',
                borderRadius: 8,
                padding: '8px 24px',
                fontSize: 14,
                cursor: 'pointer',
                fontWeight: 400,
              }}
            >
              Import &amp; Run &rarr;
            </button>
          </div>
        </section>

        <section id="docs" style={{ borderTop: '1px solid #333', maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ fontSize: 16, color: '#888', marginBottom: 8 }}>How to Use</div>
          <div style={{ fontSize: 18, color: '#888', marginBottom: 32 }}>
            Get started with JavaScript module syntax.
          </div>

          <div style={{ color: '#ddd', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
            esm.sh allows you to import{' '}
            <Link href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules" style={{ color: '#d63369', textDecoration: 'none' }}>
              JavaScript modules
            </Link>{' '}
            from http URLs, <strong style={{ color: '#fefefe' }}>no installation/build steps needed</strong>.
          </div>

          <div style={{ backgroundColor: '#111', borderRadius: 8, padding: '18px 24px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 14, marginBottom: 24, color: '#888' }}>
            import * as mod from &quot;https://esm.sh/PKG[@SEMVER][/PATH]&quot;;
          </div>

          <div style={{ color: '#ddd', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            With{' '}
            <Link href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap" style={{ color: '#d63369', textDecoration: 'none' }}>
              import maps
            </Link>
            , you can even use bare import specifiers instead of URLs:
          </div>

          <div style={{ position: 'relative', marginBottom: 32 }}>
            <pre style={{ backgroundColor: '#111', borderRadius: 8, padding: '18px 24px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 14, overflowX: 'auto', color: '#888', lineHeight: 1.5 }}>
              <code>{`<script type="importmap">
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
</script>`}</code>
            </pre>
            <button
              onClick={() => copyCode(`<script type="importmap">\n{\n  "imports": {\n    "react": "https://esm.sh/react@19.2.0",\n    "react-dom/": "https://esm.sh/react-dom@19.2.0/"\n  }\n}\n</script>\n<script type="module">\nimport React from "react";\nimport { render } from "react-dom/client";\n</script>`, setCopied2)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#888',
                padding: 6,
                borderRadius: 4,
                display: 'flex',
              }}
            >
              {copied2 ? <Check className="size-4" style={{ color: '#fefefe' }} /> : <Copy className="size-4" />}
            </button>
          </div>

          <div style={{ fontSize: 18, fontWeight: 500, color: '#fefefe', marginBottom: 16 }}>Supported Registries</div>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: '#fefefe', fontSize: 14 }}>NPM</strong>
            <div style={{ backgroundColor: '#111', borderRadius: 8, padding: '18px 24px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 14, marginTop: 8, color: '#888', lineHeight: 1.5 }}>
              <code>{`import React from "https://esm.sh/react";
import React from "https://esm.sh/react@18";
import { renderToString } from "https://esm.sh/react-dom/server";`}</code>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: '#fefefe', fontSize: 14 }}>JSR <span style={{ color: '#d63369' }}>(starts with `/jsr/`)</span></strong>
            <div style={{ backgroundColor: '#111', borderRadius: 8, padding: '18px 24px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 14, marginTop: 8, color: '#888', lineHeight: 1.5 }}>
              <code>{`import { encodeBase64 } from "https://esm.sh/jsr/@std/encoding@1.0.0/base64";
import { Hono } from "https://esm.sh/jsr/@hono/hono@4";`}</code>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: '#fefefe', fontSize: 14 }}>GitHub <span style={{ color: '#d63369' }}>(starts with `/gh/`)</span></strong>
            <div style={{ backgroundColor: '#111', borderRadius: 8, padding: '18px 24px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 14, marginTop: 8, color: '#888', lineHeight: 1.5 }}>
              <code>{`import tslib from "https://esm.sh/gh/microsoft/tslib";
import tslib from "https://esm.sh/gh/microsoft/tslib@v2.8.0";`}</code>
            </div>
          </div>
        </section>

        <section id="tsx" style={{ borderTop: '1px solid #333', maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ fontSize: 16, marginBottom: 8 }}>
            Using <span style={{ color: '#d63369' }}>esm.sh/tsx</span>
          </div>
          <div style={{ fontSize: 18, color: '#888', marginBottom: 32 }}>
            TSX just works in browsers.
          </div>

          <div style={{ color: '#ddd', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            <span style={{ color: '#d63369' }}>esm.sh/tsx</span> is a lightweight{' '}
            <strong style={{ color: '#fefefe' }}>1KB</strong> script that allows you to write{' '}
            <strong style={{ color: '#fefefe' }}>TSX</strong> directly in HTML without any build steps.
          </div>

          <pre style={{ backgroundColor: '#111', borderRadius: 8, padding: '18px 24px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 14, overflowX: 'auto', color: '#888', lineHeight: 1.5 }}>
            <code>{`<!DOCTYPE html>
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
</html>`}</code>
          </pre>
        </section>

        <section id="faq" style={{ borderTop: '1px solid #333', maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ fontSize: 16, marginBottom: 8 }}>FAQs</div>
          <div style={{ fontSize: 18, color: '#888', marginBottom: 32 }}>
            Frequently asked questions.
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, color: '#fefefe', marginBottom: 8, fontSize: 14 }}>
              Which browsers are supported?
            </div>
            <div style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>
              esm.sh supports all modern browsers which support{' '}
              <Link href="https://caniuse.com/es6-module" style={{ color: '#d63369', textDecoration: 'none' }}>ES6 Module</Link>
              . Including{' '}
              <Link href="https://deno.land" style={{ color: '#d63369', textDecoration: 'none' }}>Deno</Link>.
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, color: '#fefefe', marginBottom: 8, fontSize: 14 }}>
              Does esm.sh support private npm packages?
            </div>
            <div style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>
              Nope, but you can deploy your own esm.sh server to support private npm packages.{' '}
              <Link href="https://github.com/esm-dev/esm.sh/blob/main/HOSTING.md" style={{ color: '#d63369', textDecoration: 'none' }}>Self hosting guide</Link>.
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, color: '#fefefe', marginBottom: 8, fontSize: 14 }}>
              How can I report a bug?
            </div>
            <div style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>
              Please open an issue on{' '}
              <Link href="https://github.com/esm-dev/esm.sh/issues/new/choose" style={{ color: '#d63369', textDecoration: 'none' }}>GitHub</Link>. Thanks :)
            </div>
          </div>
        </section>

        <footer style={{ borderTop: '1px solid #333', padding: '24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 8, fontSize: 14, color: '#888' }}>
            <span>
              esm.sh is an{' '}
              <Link href="https://github.com/esm-dev/esm.sh" style={{ color: '#ddd', textDecoration: 'none' }}>
                open source
              </Link>{' '}
              project under MIT License.
            </span>
            <span style={{ color: '#555' }}>|</span>
            <span>
              Powered by{' '}
              <Link href="https://cloudflare.com" style={{ color: '#ddd', textDecoration: 'none' }}>
                Cloudflare
              </Link>.
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
