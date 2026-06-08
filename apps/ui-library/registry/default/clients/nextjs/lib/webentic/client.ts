import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_WEBENTIC_URL!,
    process.env.NEXT_PUBLIC_WEBENTIC_PUBLISHABLE_KEY!
  )
}
