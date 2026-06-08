# Webentic-Private — Contexto do Projeto

## Estrutura de Repositórios

| Tipo | Nome | URL |
|------|------|-----|
| 🔒 Privado (este) | `mmdj04/Webentic-Private` | https://github.com/mmdj04/Webentic-Private |
| 🌍 Público | `mmdj04/Webentic` | https://github.com/mmdj04/Webentic |

- **Privado**: Contém TUDO (código fonte completo, Design System, Docs, etc.)
- **Público**: Apenas Landing Page (`/`) + About (`/about`), deploy automático via Vercel

## Comandos Essenciais

```bash
# Publicar alterações no site público (rodar do diretório raiz)
./scripts/publish-public.sh git@github.com:mmdj04/Webentic.git

# Commit e push no privado
git add -A && git commit -m "..." && git push origin main
```

## Vercel

- **Projeto**: `webentic-ui` (https://webentic-ui.vercel.app)
- **Deploy Hook**: `curl -X POST https://api.vercel.com/v1/integrations/deploy/prj_9lKr7Saa6ci3FZMuEpHfYYMxpVqY/Cofny8wRo8`
- **Config**: `vercel.json` na raiz com `buildCommand`, `installCommand`, `framework: nextjs`
- **Env vars**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_API_URL`, etc. configuradas no projeto

## Modificações Importantes Feitas

### Landing Page (`apps/web/app/page.tsx`)
- Título "WEBENTIC OPEN-SOURCE" em stack (duas linhas, uppercase)
- InputGroup + Popover com hamburger para navegação
- Botões de modo acima do título removidos (só dropdown)
- MODES array: `ui-library` → `/docs/getting-started/quickstart`, `design-system` → `/design-system`, `about` → `/about`

### About Page (`apps/web/app/about/page.tsx`)
- Links: GitHub (https://github.com/mmdj04), LinkedIn, Email (hello@webentic.dev)
- Tema: `text-foreground`, `bg-background`, `text-foreground-muted`

### Providers (`apps/web/app/Providers.tsx`)
- `AuthProvider` com `alwaysLoggedIn={true}` — remove dependência de Supabase em runtime

### Design System (mesclado para o privado)
- `apps/web/app/design-system/` — páginas DS
- `apps/web/config/design-system-docs.ts` — navegação DS
- `apps/web/components/design-system-side-navigation.tsx` — sidebar DS
- `apps/web/components/mdx-components.tsx` — componentes MDX
- Registry examples em `apps/web/registry/examples.ts` (295 entries DS + 10 UI Lib)
- `apps/web/registry/default/examples/` (308 arquivos de exemplo)

### Script de Publish (`scripts/publish-public.sh`)
- Extrai landing + about para o repo público
- Remove: DS pages, docs, API routes, registry examples, contentlayer, blocks, icons, ui-patterns
- Modifica: `next.config.mjs` (remove withContentlayer), `turbo.json` (remove content:build), `page.tsx` (só about no MODES), `pnpm-workspace.yaml` (só packages existentes)

## Arquivos Relevantes

- `apps/web/app/page.tsx` — Landing page
- `apps/web/app/about/page.tsx` — About page
- `apps/web/app/layout.tsx` — Root layout
- `apps/web/app/Providers.tsx` — Provider tree
- `apps/web/vercel.json` — Vercel config (na raiz do projeto)
- `scripts/publish-public.sh` — Script de publish
- `apps/web/registry/examples.ts` — Registry examples (DS + UI Lib)
- `apps/web/config/design-system-docs.ts` — Nav do DS
- `apps/web/components/design-system-side-navigation.tsx` — Sidebar DS

## Observações

- Cloud Shell Google tem <5 GB — não rodar `pnpm install` ou `pnpm dev`
- O `.gitignore` padrão já exclui `node_modules/`, `.next/`, `.turbo/`, `.vercel/`
- O repo público `mmdj04/Webentic` é open-source e deploya em https://webentic-ui.vercel.app
