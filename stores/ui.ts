import { defineStore } from "pinia"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

export const useUIStore = defineStore("ui", () => {
  const mobileMenuOpen = ref(false)
  const toastQueue = ref<Toast[]>([])

  function openMobileMenu() {
    mobileMenuOpen.value = true
  }

  function closeMobileMenu() {
    mobileMenuOpen.value = false
  }

  function addToast(message: string, type: Toast["type"] = "info") {
    const id = Math.random().toString(36).slice(2)
    toastQueue.value.push({ id, message, type })
    setTimeout(() => clearToast(id), 4000)
  }

  function clearToast(id: string) {
    const idx = toastQueue.value.findIndex((t) => t.id === id)
    if (idx !== -1) toastQueue.value.splice(idx, 1)
  }

  return { mobileMenuOpen, toastQueue, openMobileMenu, closeMobileMenu, addToast, clearToast }
})
