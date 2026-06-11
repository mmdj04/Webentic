import { type Registry, type RegistryItem } from 'shadcn/schema'

import { blocks } from './blocks'
import { clients } from './clients'
import aiEditorRules from './default/ai-editor-rules/registry-item.json' with { type: 'json' }
import { platform } from './platform'
import { examples } from '@/registry/examples'

export const registry = {
  name: 'Webentic UI Library',
  homepage: 'https://webentic.dev',
  items: [
    ...blocks,
    ...clients,
    ...platform,
    aiEditorRules as RegistryItem,

    // Internal use only.
    ...examples,
  ],
} satisfies Registry
