<script setup lang="ts">
import { useAuthStore } from "@/stores/auth"

definePageMeta({ layout: false })

const auth = useAuthStore()
const email = ref("")
const password = ref("")
const error = ref<string | null>(null)
const isLoading = ref(false)

async function handleLogin() {
  isLoading.value = true
  error.value = null
  try {
    await auth.login(email.value, password.value)
    await navigateTo("/dashboard")
  } catch {
    error.value = "Invalid email or password."
  } finally {
    isLoading.value = false
  }
}

useSeoMeta({ title: "Login | Trendzy Tours", robots: "noindex" })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-dark-900 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="font-heading text-2xl font-bold text-white">
          Trendzy<span class="text-gold-500">Tours</span>
        </NuxtLink>
        <p class="mt-2 text-gray-400 text-sm">Staff Login</p>
      </div>
      <form class="rounded-2xl bg-white p-8 shadow-xl" @submit.prevent="handleLogin">
        <h1 class="font-heading text-2xl font-bold text-dark-900 mb-6">Sign in</h1>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-dark-900 mb-1">Email</label>
            <input v-model="email" type="email" required class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200" />
          </div>
          <div>
            <label class="block text-sm font-medium text-dark-900 mb-1">Password</label>
            <input v-model="password" type="password" required class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200" />
          </div>
        </div>
        <p v-if="error" class="mt-3 text-sm text-red-500">{{ error }}</p>
        <button
          type="submit"
          :disabled="isLoading"
          class="mt-6 w-full rounded-full bg-gold-500 py-3 font-semibold text-white shadow transition hover:bg-gold-600 disabled:opacity-60">
          {{ isLoading ? "Signing in…" : "Sign In" }}
        </button>
      </form>
    </div>
  </div>
</template>
