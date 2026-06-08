#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────
# publish-public.sh
# Extracts only public pages (Landing + About) from the private
# monorepo and pushes them to a standalone public GitHub repo.
# ──────────────────────────────────────────────────────────────

if [ $# -lt 1 ]; then
  echo "Usage: $0 <public-repo-url> [branch]"
  echo ""
  echo "   <public-repo-url>  SSH or HTTPS URL of the public GitHub repo"
  echo "   [branch]           Branch to push (default: main)"
  echo ""
  echo "Example:"
  echo "   $0 git@github.com:youruser/webentic-ui.git main"
  exit 1
fi

PUBLIC_REPO="$1"
BRANCH="${2:-main}"

# Resolve the private repo URL from the current git remote
PRIVATE_REPO="$(git remote get-url origin)"
REPO_ROOT="$(git rev-parse --show-toplevel)"
REPO_NAME="$(basename "$REPO_ROOT")"

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "==> Cloning private repo to temp directory..."
git clone --depth=1 "$PRIVATE_REPO" "$TEMP_DIR/$REPO_NAME"

cd "$TEMP_DIR/$REPO_NAME"

echo "==> Removing non-public files..."

# ── Design System pages ──
rm -rf apps/web/app/design-system

# ── Docs pages (UI Library docs) ──
rm -rf apps/web/app/\(app\)

# ── API routes (registry API, etc.) ──
rm -rf apps/web/app/api

# ── Example pages ──
rm -rf apps/web/app/example

# ── DS-specific components ──
rm -f apps/web/components/design-system-side-navigation.tsx
rm -f apps/web/components/mdx-components.tsx
rm -f apps/web/components/mobile-sidebar-sheet.tsx

# ── DS config ──
rm -f apps/web/config/design-system-docs.ts

# ── DS content & registry ──
rm -rf apps/web/content
rm -f apps/web/contentlayer.config.js
rm -rf apps/web/registry/default/examples
rm -rf apps/web/__registry__
rm -rf apps/web/scripts
rm -rf apps/web/public/r

# ── DS-only static assets ──
rm -rf apps/web/public/img/design-system-marks
rm -rf apps/web/public/img/themes
rm -rf apps/web/public/img/profile-images

# ── MDX / docs-only CSS ──
rm -f apps/web/styles/mdx.css
rm -rf apps/web/styles/code-block-variables.css

# ── Supabase local dev ──
rm -rf apps/web/supabase

# ── ESLint config (dev-only) ──
rm -f apps/web/eslint.config.cjs

# ── Blocks package (not needed) ──
rm -rf blocks

# ── Extra packages not needed for public pages ──
rm -rf packages/icons
rm -rf packages/ui-patterns
rm -rf packages/eslint-config-webentic

# ── DS leftover from merge ──
rm -rf apps/design-system 2>/dev/null || true
rm -rf apps/web/design-system 2>/dev/null || true

echo "==> Cleaning up registry examples (keeping only original 10 UI Lib entries)..."
# Replace examples.ts with only the original UI Library entries
cat > apps/web/registry/examples.ts << 'REGISTRY_EOF'
import type { RegistryItem } from 'shadcn/schema'

export const examples: RegistryItem[] = [
  {
    name: 'dropzone-demo',
    type: 'registry:example',
    registryDependencies: [],
    files: [
    {
    path: 'registry/default/examples/dropzone-demo.tsx',
    type: 'registry:example',
    },
    ],
  },
  {
    name: 'realtime-cursor-demo',
    type: 'registry:example',
    registryDependencies: [],
    files: [
    {
    path: 'registry/default/examples/realtime-cursor-demo.tsx',
    type: 'registry:example',
    },
    ],
  },
  {
    name: 'realtime-flow-demo',
    type: 'registry:example',
    registryDependencies: [],
    files: [
    {
    path: 'registry/default/examples/realtime-flow-demo.tsx',
    type: 'registry:example',
    },
    ],
  },
  {
    name: 'realtime-monaco-demo',
    type: 'registry:example',
    registryDependencies: [],
    files: [
    {
    path: 'registry/default/examples/realtime-monaco-demo.tsx',
    type: 'registry:example',
    },
    ],
  },
  {
    name: 'password-based-auth-demo',
    type: 'registry:example',
    registryDependencies: [],
    files: [
    {
    path: 'registry/default/examples/password-based-auth.tsx',
    type: 'registry:example',
    },
    ],
  },
  {
    name: 'current-user-avatar-demo',
    type: 'registry:example',
    registryDependencies: [],
    files: [
    {
    path: 'registry/default/examples/current-user-avatar-demo.tsx',
    type: 'registry:example',
    },
    ],
  },
  {
    name: 'current-user-avatar-preview',
    type: 'registry:example',
    registryDependencies: [],
    files: [
    {
    path: 'registry/default/examples/current-user-avatar-preview.tsx',
    type: 'registry:example',
    },
    ],
  },
  {
    name: 'realtime-avatar-stack-demo',
    type: 'registry:example',
    registryDependencies: [],
    files: [
    {
    path: 'registry/default/examples/realtime-avatar-stack-demo.tsx',
    type: 'registry:example',
    },
    ],
  },
  {
    name: 'realtime-avatar-stack-preview',
    type: 'registry:example',
    registryDependencies: [],
    files: [
    {
    path: 'registry/default/examples/realtime-avatar-stack-preview.tsx',
    type: 'registry:example',
    },
    ],
  },
  {
    name: 'infinite-query-hook-demo',
    type: 'registry:example',
    registryDependencies: [],
    files: [
    {
    path: 'registry/default/examples/infinite-query-hook-demo.tsx',
    type: 'registry:example',
    },
    ],
  },
]
REGISTRY_EOF

echo "==> Removing contentlayer from next.config.mjs..."
sed -i '/import { withContentlayer } from .next-contentlayer2./d' apps/web/next.config.mjs
sed -i 's/export default withContentlayer(nextConfig)/export default nextConfig/' apps/web/next.config.mjs

echo "==> Simplifying landing page nav for public repo..."
sed -i '/id: .ui-library.,/,/},/d' apps/web/app/page.tsx
sed -i '/id: .design-system.,/,/},/d' apps/web/app/page.tsx

echo "==> Creating public .gitignore..."
cat > .gitignore << 'GITIGNORE_EOF'
# dependencies
node_modules/
.pnpm-store/

# next.js
.next/

# turbo
.turbo/

# production
dist/

# misc
.env
.env*.local
*.tsbuildinfo
.contentlayer
.vercel
*.log
.DS_Store
GITIGNORE_EOF

echo "==> Creating public README.md..."
cat > README.md << 'README_EOF'
# Webentic UI

Open-source UI library and design system by [@mmdj04](https://github.com/mmdj04).

Built with Next.js, Tailwind CSS v4, Radix UI, and TypeScript.

## Getting Started

```bash
pnpm install
pnpm dev
```

## Deploy

This repo auto-deploys to [webentic-ui.vercel.app](https://webentic-ui.vercel.app) via Vercel.
README_EOF

echo "==> Creating public LICENSE (MIT)..."
cat > LICENSE << 'LICENSE_EOF'
MIT License

Copyright (c) 2026 Webentic

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
LICENSE_EOF

echo "==> Initializing new git repo with public files..."
rm -rf .git
git init
git checkout -b "$BRANCH"
git add -A
git commit -m "Initial public release: Landing + About pages

Extracted from the private monorepo. Contains only the minimal
files needed to render the landing page (/) and about page (/about)
at https://webentic-ui.vercel.app

Includes:
- Next.js app with Tailwind CSS v4
- UI component library (InputGroup, Popover, etc.)
- Auth/Theme/Query providers
- Dark/light theme support"

echo "==> Pushing to public repo: $PUBLIC_REPO ($BRANCH)"
git remote add origin "$PUBLIC_REPO"
git push -u origin "$BRANCH" --force

echo ""
echo "✓ SUCCESS: Public repo published to $PUBLIC_REPO"
echo ""
echo "Next steps:"
echo "  1. On GitHub, go to the public repo → Settings → Pages"
echo "  2. Connect to Vercel for auto-deploy"
echo "  3. Set build command: npx --yes pnpm@10.24.0 run build"
echo "  4. Set output directory: apps/web/.next (or leave blank)"