import type { EmailOtpType } from '@supabase/supabase-js'
import { defineEventHandler, getQuery, sendRedirect } from 'h3'

import { createWebenticServerClient } from '@/registry/default/clients/nuxtjs/server/webentic/client'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token_hash = query.token_hash as string | null
  const type = query.type as EmailOtpType | null
  const _next = query.next as string | undefined
  const next = _next?.startsWith('/') ? _next : '/'

  if (token_hash && type) {
    const webentic = createWebenticServerClient(event)

    const { error } = await webentic.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      return sendRedirect(event, next)
    } else {
      return sendRedirect(event, `/auth/error?error=${encodeURIComponent(error.message)}`)
    }
  }

  return sendRedirect(event, `/auth/error?error=${encodeURIComponent('No token hash or type')}`)
})
