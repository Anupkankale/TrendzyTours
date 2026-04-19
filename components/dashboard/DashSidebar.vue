<script setup lang="ts">
import { useAuthStore } from "@/stores/auth"
import {
  HomeIcon,
  GlobeAltIcon,
  CalendarIcon,
  UsersIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline"

const auth = useAuthStore()

const allNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: HomeIcon, roles: ["admin", "sales", "customer", "seo"] },
  { label: "Leads", href: "/dashboard/leads", icon: UserGroupIcon, roles: ["admin", "sales"] },
  { label: "Tours", href: "/dashboard/tours", icon: GlobeAltIcon, roles: ["admin", "sales"] },
  { label: "Bookings", href: "/dashboard/bookings", icon: CalendarIcon, roles: ["admin", "sales", "customer"] },
  { label: "Users", href: "/dashboard/users", icon: UsersIcon, roles: ["admin"] },
  { label: "Blog", href: "/dashboard/blog", icon: DocumentTextIcon, roles: ["admin", "seo"] },
  { label: "SEO Settings", href: "/dashboard/seo", icon: MagnifyingGlassIcon, roles: ["admin", "seo"] },
  { label: "My Profile", href: "/dashboard/profile", icon: UserCircleIcon, roles: ["admin", "sales", "customer", "seo"] },
]

const navItems = computed(() =>
  allNavItems.filter((item) => !auth.role || item.roles.includes(auth.role))
)
</script>

<template>
  <aside class="hidden w-64 flex-shrink-0 flex-col bg-dark-900 lg:flex">
    <div class="flex h-16 items-center px-6">
      <NuxtLink to="/" class="font-heading text-lg font-bold text-white">
        Trendzy<span class="text-gold-500">Tours</span>
      </NuxtLink>
    </div>
    <nav class="flex-1 overflow-y-auto px-3 py-4">
      <NuxtLink
        v-for="item in navItems"
        :key="item.href"
        :to="item.href"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-dark-800 hover:text-white"
        active-class="bg-dark-800 text-white">
        <component :is="item.icon" class="h-5 w-5" />
        {{ item.label }}
      </NuxtLink>
    </nav>
    <div class="border-t border-dark-800 p-4">
      <button
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white transition"
        @click="auth.logout()">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        Sign Out
      </button>
    </div>
  </aside>
</template>
