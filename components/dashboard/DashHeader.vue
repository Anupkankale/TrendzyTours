<script setup lang="ts">
import { useAuthStore } from "@/stores/auth"

const auth = useAuthStore()
</script>

<template>
  <header class="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
    <div class="text-sm text-gray-500">
      <NuxtLink to="/" class="hover:text-gold-600 transition">← Back to Website</NuxtLink>
    </div>
    <div class="flex items-center gap-3">
      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 font-heading font-bold text-white text-sm">
        {{ auth.user?.name?.charAt(0) ?? "U" }}
      </div>
      <div class="hidden sm:block">
        <p class="text-sm font-medium text-dark-900">{{ auth.user?.name }}</p>
        <p class="text-xs text-gray-400 capitalize">{{ auth.user?.role }}</p>
      </div>
    </div>
  </header>
</template>
