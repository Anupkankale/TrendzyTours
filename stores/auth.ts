import { defineStore } from "pinia"
import type { User, Role } from "@/types/auth"

export const useAuthStore = defineStore("auth", () => {
  const { apiFetch } = useApi()
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const role = computed<Role | null>(() => user.value?.role ?? null)
  const isAdmin = computed(() => user.value?.role === "admin")
  const isSales = computed(() => user.value?.role === "sales" || isAdmin.value)
  const isSEO = computed(() => user.value?.role === "seo" || isAdmin.value)
  const isCustomer = computed(() => user.value?.role === "customer")

  async function login(email: string, password: string) {
    isLoading.value = true
    try {
      const data = await apiFetch<{ user: User }>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      })
      user.value = data.user
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" })
    user.value = null
  }

  async function fetchCurrentUser() {
    try {
      const data = await apiFetch<{ user: User }>("/api/auth/me")
      user.value = data.user
    } catch {
      user.value = null
    }
  }

  return { user, isLoading, isAuthenticated, role, isAdmin, isSales, isSEO, isCustomer, login, logout, fetchCurrentUser }
})
