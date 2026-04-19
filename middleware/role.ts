import { useAuthStore } from "@/stores/auth"
import type { Role } from "@/types/auth"

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (auth.isAdmin) return

  const allowedRoles = (to.meta.roles ?? (to.meta.requiredRole ? [to.meta.requiredRole] : null)) as Role[] | null
  if (!allowedRoles) return

  if (!auth.role || !allowedRoles.includes(auth.role)) {
    return navigateTo("/dashboard")
  }
})
