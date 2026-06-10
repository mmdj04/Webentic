import { defineNuxtRouteMiddleware, navigateTo, useRequestEvent } from 'nuxt/app'

import { createWebenticServerClient } from '../webentic/client'

export default defineNuxtRouteMiddleware(async (to) => {
  const event = useRequestEvent()

  // create Supabase SSR client directly here
  const webentic = createWebenticServerClient(event)

  // check current user
  const {
    data: { user },
  } = await webentic.auth.getUser()

  if (!user && to.path !== '/login') {
    return navigateTo('/login')
  }
})
