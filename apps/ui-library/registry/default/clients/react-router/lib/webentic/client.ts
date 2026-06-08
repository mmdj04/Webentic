/// <reference types="vite/types/importMeta.d.ts" />
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    import.meta.env.VITE_WEBENTIC_URL!,
    import.meta.env.VITE_WEBENTIC_PUBLISHABLE_KEY!
  )
}
