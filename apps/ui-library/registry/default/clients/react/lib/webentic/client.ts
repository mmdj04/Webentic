import { createClient as createWebenticClient } from '@supabase/supabase-js'

export function createClient() {
  return createWebenticClient(
    import.meta.env.VITE_WEBENTIC_URL!,
    import.meta.env.VITE_WEBENTIC_PUBLISHABLE_KEY!
  )
}
