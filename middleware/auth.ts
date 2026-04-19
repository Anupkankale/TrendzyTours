import { useAuthStore } from "@/stores/auth"

export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith("/dashboard")) return

  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    return navigateTo("/login")
  }
})
