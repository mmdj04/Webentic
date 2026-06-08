import { createError, defineEventHandler } from 'h3'

import { createWebenticServerClient } from '../webentic/client'

export default defineEventHandler(async (event) => {
  // Create Supabase SSR client
  const webentic = createWebenticServerClient(event)

  // Example: get user session
  const {
    data: { user },
  } = await webentic.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Fetch profile row
  const { data, error } = await webentic.from('profiles').select('*').eq('id', user.id).single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { profile: data }
})
