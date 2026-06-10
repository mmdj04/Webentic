import { defineEventHandler, sendRedirect } from 'h3'

import { createWebenticServerClient } from '@/registry/default/clients/nuxtjs/server/webentic/client'

export default defineEventHandler(async (event) => {
  const webentic = createWebenticServerClient(event)

  // Get user claims
  const { data } = await webentic.auth.getClaims()
  const user = data?.claims

  const pathname = event.node.req.url || '/'

  // Redirect if no user and not already on login/auth route
  if (!user && !pathname.startsWith('/login') && !pathname.startsWith('/auth')) {
    return sendRedirect(event, '/auth/login')
  }

  // Return event as-is (you could return any object if needed)
  return { user }
})
