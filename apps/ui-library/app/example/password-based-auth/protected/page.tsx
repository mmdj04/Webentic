import { redirect } from 'next/navigation'

import { LogoutButton } from '@/registry/default/blocks/password-based-auth-nextjs/components/logout-button'
import { createClient } from '@/registry/default/clients/nextjs/lib/webentic/server'

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/example/password-based-auth/auth/login')
  }

  return (
    <>
      <p>Hello {data.user.email}</p>
      <LogoutButton />
    </>
  )
}
