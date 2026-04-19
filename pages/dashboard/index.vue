<script setup lang="ts">
import { useAuthStore } from "@/stores/auth"
import { ChartBarIcon, CalendarIcon, UsersIcon, GlobeAltIcon } from "@heroicons/vue/24/outline"

definePageMeta({ layout: "dashboard", middleware: ["auth"] })

const auth = useAuthStore()

const stats = [
  { label: "Total Bookings", value: "124", icon: CalendarIcon, change: "+12% this month" },
  { label: "Active Tours", value: "8", icon: GlobeAltIcon, change: "2 departing this week" },
  { label: "Enquiries", value: "47", icon: ChartBarIcon, change: "+8 today" },
  { label: "Registered Users", value: "892", icon: UsersIcon, change: "+23 this week" },
]
</script>

<template>
  <div>
    <h1 class="font-heading text-2xl font-bold text-dark-900">
      Welcome back, {{ auth.user?.name ?? "Team" }}
    </h1>
    <p class="mt-1 text-sm text-gray-500 capitalize">Role: {{ auth.user?.role }}</p>

    <div class="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <div class="rounded-xl bg-gold-100 p-3">
          <component :is="stat.icon" class="h-6 w-6 text-gold-600" />
        </div>
        <div>
          <p class="font-heading text-2xl font-bold text-dark-900">{{ stat.value }}</p>
          <p class="text-sm font-medium text-gray-600">{{ stat.label }}</p>
          <p class="mt-1 text-xs text-gray-400">{{ stat.change }}</p>
        </div>
      </div>
    </div>

    <div class="mt-10 rounded-2xl bg-white p-6 shadow-sm">
      <h2 class="font-heading text-lg font-semibold text-dark-900 mb-4">Quick Actions</h2>
      <div class="flex flex-wrap gap-3">
        <NuxtLink to="/dashboard/tours/create" class="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-white hover:bg-gold-600">Add Tour</NuxtLink>
        <NuxtLink to="/dashboard/bookings" class="rounded-full bg-dark-900 px-5 py-2 text-sm font-semibold text-white hover:bg-dark-800">View Bookings</NuxtLink>
        <NuxtLink to="/dashboard/blog/create" class="rounded-full border border-gold-400 px-5 py-2 text-sm font-semibold text-gold-600 hover:bg-gold-50">New Blog Post</NuxtLink>
      </div>
    </div>
  </div>
</template>
