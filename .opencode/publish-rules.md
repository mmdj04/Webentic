# Regras de Publicação

## O que NÃO vai pro repositório público

O script `scripts/publish-public.sh` remove automaticamente:

### Páginas
- `apps/web/app/design-system/` — Design System
- `apps/web/app/(app)/` — UI Library docs
- `apps/web/app/api/` — API routes
- `apps/web/app/example/` — Example pages

### Componentes DS
- `apps/web/components/design-system-side-navigation.tsx`
- `apps/web/components/mdx-components.tsx`
- `apps/web/components/mobile-sidebar-sheet.tsx`

### Config
- `apps/web/config/design-system-docs.ts`
- `apps/web/eslint.config.cjs`

### Conteúdo
- `apps/web/content/` — MDX docs
- `apps/web/contentlayer.config.js`
- `apps/web/registry/default/examples/` — DS examples
- `apps/web/__registry__/`
- `apps/web/scripts/` — Build scripts
- `apps/web/public/r/` — Registry output

### Pacotes
- `packages/icons/`
- `packages/ui-patterns/`
- `packages/eslint-config-webentic/`
- `blocks/`

### Estilos
- `apps/web/styles/mdx.css`
- `apps/web/styles/code-block-variables.css`

## Fixes automáticos do script

Além de remover arquivos, o script também modifica:

- `apps/web/package.json`: remove deps de pacotes deletados e simplifica o build
- `apps/web/next.config.mjs`: remove `transpilePackages` e `redirects` inválidos
- `turbo.json`: remove tasks `content:build` e `build:registry`
- `apps/web/app/page.tsx`: simplifica MODES (só about)
- `vercel.json`: remove `rootDirectory` (configurado via projeto na Vercel)

## Exemplo de publicação

```bash
./scripts/publish-public.sh https://github.com/mmdj04/Webentic.git
```
