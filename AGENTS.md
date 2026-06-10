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

## Vercel Deploy
- Push to `mmdj04/Webentic` → auto-deploys `webentic-ui` (production)
- Config: `vercel.json` (root), Node 24.x, pnpm 10.24.0
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_API_URL`, etc.
- No `rootDirectory` in vercel.json (set in Vercel project settings)
