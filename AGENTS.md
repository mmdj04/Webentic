# Skills — Design System, UI Library & UI Patterns

## Design System Docs
- **Component inventory**: `apps/web/app/docs/`, `packages/ui/src/`, `packages/ui-patterns/src/`
- **Live at**: `/docs`
- **DS guidelines**: components live in `packages/` (ui, ui-patterns, icons, common); each has its own `package.json` with `workspace:*` deps
- **Styles**: Tailwind CSS v4 via `packages/config`

## UI Library (packages/ui)
- Shadcn/ui-based component library — 50+ Radix primitives
- Components in `packages/ui/src/components/`
- Each component owns its `package.json` dependencies
- Rule: deps imported in source MUST be declared in `packages/ui/package.json`, not hoisted from `apps/web`

## UI Patterns (packages/ui-patterns)
- Higher-level composed patterns (FilterBar, Table, AssistantChat, etc.)
- Components in `packages/ui-patterns/src/`
- May depend on `ui`, `icons`, `common`, `api-types`

## Data Flow
- `/search` page does NOT query GitHub API — it queries `repository_analyses` table (status = 'completed')
- RLS: anyone can SELECT completed analyses (anon policy); INSERT/UPDATE restricted to owner
- Agent (background worker) handles: search GitHub → filter 1k+ stars & file types → fetch source files → Gemini generation → store in `repository_analyses`
- User only browses/view docs; no user-triggered generation in search page
- `repository_analyses.analysis_data` jsonb stores repo metadata (stars, forks, description, language, topics, indexed_commit_sha, default_branch)

## Vercel Deploy
- Push to `mmdj04/Webentic` → auto-deploys `webentic-ui` (production)
- Config: `vercel.json` (root), Node 24.x, pnpm 10.24.0
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_API_URL`, etc.
- No `rootDirectory` in vercel.json (set in Vercel project settings)

## Routes
- `/search` — Browse and search documented repositories
- `/docs/{owner}/{repo}` — Dedicated wiki page with sidebar TOC, Mermaid diagrams, commit SHA display
- `/settings` — Agent config management (create, start, stop agents; view live logs)

## Edge Function (agent-worker)
- `supabase/functions/agent-worker/index.ts` — Deno/TypeScript
- Fetches repo source files, adds line numbers to content, generates DeepWiki-style docs via Gemini
- Stores commit SHA (`indexed_commit_sha`) and `default_branch` in `analysis_data`
- Deployed via `npx supabase functions deploy agent-worker` (683.8kB)
- Builder uses Deno runtime with `jsr:@supabase/supabase-js@2`

## Webentic Backup
- Two repos: **public** `mmdj04/Webentic` (production, respects `.gitignore`) and **private** `mmdj04/Webentic-backup` (full local backup with ALL files)
- Backup includes `node_modules`, `.next`, `.turbo`, `supabase/.temp` — everything
- Branch: `master` (not `main`); synced by copying all files → fresh `git init` → force push
