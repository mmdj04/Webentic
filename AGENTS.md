# Webentic-Private — Contexto do Projeto

## Estrutura de Repositórios

| Tipo | Nome | URL |
|------|------|-----|
| 🔒 Privado (este) | `mmdj04/Webentic-Private` | https://github.com/mmdj04/Webentic-Private |
| 🌍 Público | `mmdj04/Webentic` | https://github.com/mmdj04/Webentic |

- **Privado**: Contém TUDO (código fonte completo, Design System, Docs, etc.)
- **Público**: Apenas Landing (`/`) e ESM CDN (`/esm`)

## Comandos Essenciais

```bash
# Publicar alterações no site público (rodar do diretório raiz)
# SEMPRE use HTTPS com token no Cloud Shell (SSH não funciona — sem keys)
./scripts/publish-public.sh https://mmdj04:TOKEN@github.com/mmdj04/Webentic.git

# Commit e push no privado
git add -A && git commit -m "..." && git push origin main
```

## Vercel

- **Projeto**: `webentic-ui` (https://webentic-ui.vercel.app)
- **Deploy**: automático via GitHub — push em `mmdj04/Webentic` (público) dispara build
- **Config**: `vercel.json` na raiz com `framework: nextjs`
- **Env vars**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_API_URL`, etc. configuradas no projeto

## Modificações Importantes Feitas

### Landing Page (`apps/web/app/page.tsx`)
- Título "WEBENTIC OPEN-SOURCE" em stack (duas linhas, uppercase)
- InputGroup + Popover com hamburger para navegação
- MODES array: `ui-library`, `design-system`, `esm` (about removido)
- Publish script strips `ui-library`, `design-system`, `about` do MODES

### ESM Page (`apps/web/app/esm/page.tsx`)
- Hero "Webentic Open-Source" (mesmo estilo do antigo About)
- Theme toggle (Sun/Moon) no header substituindo Playground
- CodeBlocks com syntax highlighting via `CodeBlock` do DS

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
- Extrai landing + esm para o repo público (`mmdj04/Webentic`)
- Remove: DS pages, docs, API routes, registry examples, contentlayer, blocks, icons, ui-patterns
- Modifica: `next.config.mjs` (remove withContentlayer), `turbo.json` (remove content:build), `page.tsx` (strips ui-library, design-system, about do MODES), `pnpm-workspace.yaml` (só packages existentes)

## Arquivos Relevantes

- `apps/web/app/page.tsx` — Landing page
- `apps/web/app/esm/page.tsx` — ESM CDN page
- `apps/web/app/layout.tsx` — Root layout
- `apps/web/app/Providers.tsx` — Provider tree
- `apps/web/vercel.json` — Vercel config (na raiz do projeto)
- `scripts/publish-public.sh` — Script de publish
- `packages/ui/src/components/CodeBlock/` — CodeBlock copiado do ui-patterns para o público

## Observações

- Cloud Shell Google tem <5 GB — não rodar `pnpm install` ou `pnpm dev`
- O `.gitignore` padrão já exclui `node_modules/`, `.next/`, `.turbo/`, `.vercel/`
- O repo público `mmdj04/Webentic` é open-source e deploya em https://webentic-ui.vercel.app

## Learnings (Evitar Erros Recorrentes)

### Build Vercel: `next-themes` ausente em `packages/ui`
- **Erro**: Build falhou no Vercel porque `packages/ui/src/components/ThemeProvider/ThemeProvider.tsx` importava `next-themes`, mas a dependência só existia em `apps/web/package.json`, não em `packages/ui/package.json`
- **Sintoma**: Erro de módulo não encontrado durante o build no Vercel (funcionava local porque o pnpm workspace hoistava)
- **Correção**: Adicionar `"next-themes": "catalog:"` em `packages/ui/package.json:dependencies`
- **Regra**: Toda dependência usada por `packages/ui` precisa estar declarada no seu próprio `package.json`, mesmo que já exista em `apps/web` — o pnpm workspace hoist pode mascarar a falta
