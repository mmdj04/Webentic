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

## Supabase Studio Design System

### Layout Components
- **PageContainer** (`ui-patterns/PageContainer`): `mx-auto w-full @container px-6 xl:px-10` with size variants `small` (max-w-[768px]), `default` (max-w-[1200px]), `large` (max-w-[1600px]), `full` (max-w-none)
- **PageHeader** (`ui-patterns/PageHeader`): `PageHeaderMeta` > `PageHeaderSummary` > `PageHeaderTitle` + `PageHeaderDescription`
- **PageSection** (`ui-patterns/PageSection`): `PageSectionMeta` > `PageSectionSummary` > `PageSectionTitle` + `PageSectionDescription` + `PageSectionContent`
- Page structure: `min-h-dvh flex flex-col bg-background`, sections separated by `border-b border-muted`

### Card
- **Card**: `overflow-hidden rounded-lg border bg-surface-100 shadow-xs` — padding via `--card-padding-x`
- **CardHeader**: `py-4 px-(--card-padding-x) border-b` — CardTitle is `text-xs font-mono uppercase`
- **CardContent**: `py-4 px-(--card-padding-x) border-b last:border-none`
- **CardFooter**: `flex items-center py-4 px-(--card-padding-x)` — actions `justify-end`

### Button (custom ui package, NOT shadcn)
- Prop `type` (not `variant`): `primary` (brand), `default` (bg-alternative), `secondary`, `outline`, `dashed`, `link`, `text` (hover:bg-surface-300), `danger` (destructive), `warning`
- Sizes: `tiny` (default, h-[26px]), `small` (h-[34px]), `medium` (h-[38px]), `large` (h-[42px]), `xlarge` (h-[50px])
- Props: `icon`, `iconLeft`, `iconRight`, `loading`, `block`, `rounded`, `asChild`, `htmlType`

### Badge (shadcn/ui)
- `rounded-full uppercase text-[9px] px-[5.5px] py-[3px] tracking-[0.07em] font-medium`
- Variants: `default` (bg-surface-75), `warning` (bg-warning/10), `success` (bg-brand/10), `destructive`, `secondary`

### Form
- **FormItemLayout** (`ui-patterns/form/FormItemLayout`): Wraps `FormItem` + `FormLayout`
- Props: `layout` (`horizontal` | `vertical` | `flex` | `flex-row-reverse`), `label`, `description`, `labelOptional`, `size`, `align`
- Pattern: `<FormItemLayout layout="flex-row-reverse" label="Name" description="..."><Input /></FormItemLayout>`

### Input
- **Input** (shadcn/ui): `border border-control bg-foreground/[.026] rounded-md px-3 py-2 text-sm`, size: `small` default
- **InputGroup** (shadcn/ui): `border border-control rounded-md` with `InputGroupInput`, `InputGroupAddon`, `InputGroupButton`, `InputGroupText`
- **Select** (shadcn/ui): `border border-strong hover:border-stronger bg-alternative text-xs`

### Feedback & Navigation
- **AlertDialog**: `AlertDialogTitle` (border-b + px-5 py-3), `AlertDialogDescription` (px-5 pt-3.5 pb-4), `AlertDialogFooter` (border-t py-3 px-5), `AlertDialogBody`
- **Dialog**: `DialogHeader`, `DialogFooter`, `DialogContent` (bg-dash-sidebar), sizes: tiny → xxxlarge
- **Tabs**: `TabsList` (border-bottom), `TabsTrigger` (border-b-2 transparent, data-[state=active]: border-foreground)
- **Tooltip**: `rounded-md border bg-alternative px-3 py-1.5 text-xs text-foreground shadow-md`
- **InfoTooltip** (`ui-patterns/info-tooltip`): SVG info icon with TooltipContent, `fill-foreground-muted w-4 h-4`
- **Separator**: `shrink-0 bg-border-muted` (horizontal: h-px, vertical: w-px)

### Design Tokens
- Backgrounds: `bg-background`, `bg-surface-100`, `bg-alternative`, `bg-muted`, `bg-selection`, `bg-overlay`, `bg-dash-sidebar`, `bg-surface-75`, `bg-control`
- Text: `text-foreground`, `text-foreground-light`, `text-foreground-lighter`, `text-foreground-muted`, `text-foreground-light`
- Borders: `border-muted`, `border-strong`, `border-stronger`, `border-control`, `border-button`, `border-border-muted`, `border-overlay`
- Brand: `brand-400`, `brand-500`, `brand-600`, `bg-brand-400`, `bg-brand/10`, etc.
- Status: `destructive`, `warning`, `success` — each with `-300/400/500/600` scale

### Page Patterns (from `/settings`)
- Sections: `PageSection` → `Card` → `CardHeader` (icon + CardTitle + Badges) → `CardContent` (FormItemLayout) → `CardFooter` (justify-end space-x-2)
- Auth confirmation: `AlertDialog` wrapping sign out
- Table: `Table` with `TableHeader`/`TableBody`, action buttons in last column (Logs + Start/Stop + Delete)
- Loading states: `Loader2` with `animate-spin text-foreground-muted`
- Empty states: centered text with icon + description
- Inline alerts: `p-3 border rounded-lg flex items-start gap-2` with status colors

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
- Branch: `main`; synced by copying all files → fresh `git init` → force push
