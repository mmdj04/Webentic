# Webentic-Private — Contexto do Projeto

## Estrutura de Repositórios

| Tipo | Nome | URL |
|------|------|-----|
| 🔒 Privado (este) | `mmdj04/Webentic-Private` | https://github.com/mmdj04/Webentic-Private |
| 🌍 Público | `mmdj04/Webentic` | https://github.com/mmdj04/Webentic |

- **Privado**: Contém TUDO (código fonte completo, Design System, Docs, etc.)
- **Público**: Landing (`/`), Search (`/search`) e Settings (`/settings`)

## Publicação (fora deste repositório)

O repositório público é mantido manualmente. O processo é:

1. Clonar o privado
2. Copiar tudo para um diretório limpo
3. Criar `.gitignore` no diretório limpo com os padrões de exclusão (ver abaixo)
4. Remover dependências/deploys que não existem no público
5. `git init && git add -A && git commit && git push`

### Padrões do `.gitignore` do repo público

```gitignore
# ── Standard ignores ──
node_modules/
.pnpm-store/
.next/
.turbo/
dist/
.env
.env*.local
*.tsbuildinfo
.contentlayer
.vercel
*.log
.DS_Store
.github/

# ── Páginas exclusivas do privado ──
apps/web/app/(app)/
apps/web/app/api/
apps/web/app/design-system/
apps/web/app/example/

# ── Componentes/Config do DS ──
apps/web/components/design-system-side-navigation.tsx
apps/web/components/mdx-components.tsx
apps/web/components/mobile-sidebar-sheet.tsx
apps/web/config/design-system-docs.ts

# ── Conteúdo MDX / registry / scripts ──
apps/web/content/
apps/web/contentlayer.config.js
apps/web/__registry__/
apps/web/scripts/
apps/web/public/r/
apps/web/registry/default/examples/
apps/web/registry/examples.ts

# ── Assets exclusivos do DS ──
apps/web/public/img/design-system-marks/
apps/web/public/img/themes/
apps/web/public/img/profile-images/

# ── Estilos MDX ──
apps/web/styles/mdx.css
apps/web/styles/code-block-variables.css

# ── Dev / lint ──
apps/web/supabase/
apps/web/eslint.config.cjs

# ── Packages não usados no público ──
blocks/
packages/eslint-config-webentic/
packages/common/assets/images/archive/
```

### Pós-processamento manual após copiar

Antes do `git commit`, editar:

- `apps/web/package.json`: remover deps `@webentic/vue-blocks`, `eslint-config-webentic`, `contentlayer2`, `next-contentlayer2`; simplificar scripts (`"build": "next build --turbopack"`)
- `apps/web/next.config.mjs`: remover import `withContentlayer`, trocar `export default withContentlayer(nextConfig)` → `export default nextConfig`, remover `transpilePackages: ['icons']`, remover bloco `redirects`
- `turbo.json`: remover tasks `content:build`, `build:registry`
- `apps/web/app/page.tsx`: remover Popover, MODES, activeMode — deixar só input de busca
- `pnpm-workspace.yaml`: ajustar `packages` e `catalog` (copiar do template no diretório limpo)
- `vercel.json`: remover `rootDirectory` e `outputDirectory`

## Vercel

- **Projeto único**: `webentic-ui` (https://webentic-ui.vercel.app)
- **Deploy**: automático via GitHub — push em `mmdj04/Webentic` (público) dispara build
- **Config**: `vercel.json` na raiz com `framework: nextjs`
- **Env vars**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_API_URL`, etc. configuradas no projeto
- **Node**: 24.x
- **Instalar**: `npx --yes pnpm@10.24.0 install`
- **Build**: `npx --yes pnpm@10.24.0 run build`
- **Root directory**: `apps/web`

## Páginas no Repositório Público

- `/` — Landing page (InputGroup de busca, título "WEBENTIC OPEN-SOURCE")
- `/search?q=...` — Resultados de busca
- `/settings` — Formulário de configurações (usa `packages/ui` + `packages/ui-patterns`)

## Packages no Repositório Público

| Package | Presente? |
|---------|-----------|
| `packages/ui` (shadcn) | ✅ |
| `packages/ui-patterns` | ✅ |
| `packages/icons` | ✅ |
| `packages/common` | ✅ |
| `packages/api-types` | ✅ |
| `packages/config` | ✅ |
| `packages/tsconfig` | ✅ |
| `packages/eslint-config-webentic` | ❌ |
| `blocks/` | ❌ |

## Providers

- `AuthProvider` com `alwaysLoggedIn={true}` — não depende de Supabase em runtime

## Observações

- Cloud Shell Google tem <5 GB — não rodar `pnpm install` ou `pnpm dev`
- O repo público `mmdj04/Webentic` é open-source e deploya em https://webentic-ui.vercel.app

## Learnings (Evitar Erros Recorrentes)

### Build Vercel: `next-themes` ausente em `packages/ui`
- **Erro**: Build falhou no Vercel porque `packages/ui/src/components/ThemeProvider/ThemeProvider.tsx` importava `next-themes`, mas a dependência só existia em `apps/web/package.json`, não em `packages/ui/package.json`
- **Sintoma**: Erro de módulo não encontrado durante o build no Vercel (funcionava local porque o pnpm workspace hoistava)
- **Correção**: Adicionar `"next-themes": "catalog:"` em `packages/ui/package.json:dependencies`
- **Regra**: Toda dependência usada por `packages/ui` precisa estar declarada no seu próprio `package.json`, mesmo que já exista em `apps/web` — o pnpm workspace hoist pode mascarar a falta
