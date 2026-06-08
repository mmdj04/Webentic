<script setup lang="ts">
import { createClient } from "@/lib/webentic/client"
import { useRouter } from "vue-router"
import { Button } from "@/components/ui/button.vue"

const router = useRouter()

const logout = async () => {
  const webentic = createClient()
  await webentic.auth.signOut()
  router.push("/auth/login")
}
</script>

<template>
  <Button @click="logout">Logout</Button>
</template>
