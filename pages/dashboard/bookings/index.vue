<script setup lang="ts">
import { CalendarIcon, FunnelIcon, MagnifyingGlassIcon } from "@heroicons/vue/24/outline"
import type { BookingStatus } from "@/types/booking"

definePageMeta({ layout: "dashboard", middleware: ["auth", "role"], meta: { roles: ["admin", "sales"] } })

const bookingsStore = useBookingsStore()

onMounted(() => bookingsStore.fetchBookings())

const search = ref("")
const statusFilter = ref<BookingStatus | "all">("all")
const dateFrom = ref("")
const dateTo = ref("")

const statusOptions: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
]

const statusConfig: Record<BookingStatus, { label: string; classes: string }> = {
  pending:   { label: "Pending",   classes: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmed", classes: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", classes: "bg-red-100 text-red-700" },
}

const filtered = computed(() => {
  return bookingsStore.bookings.filter((b) => {
    if (statusFilter.value !== "all" && b.status !== statusFilter.value) return false

    if (dateFrom.value && b.travelDate < dateFrom.value) return false
    if (dateTo.value && b.travelDate > dateTo.value) return false

    const q = search.value.toLowerCase()
    if (q) {
      const match =
        b.customerName.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.tourName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q)
      if (!match) return false
    }

    return true
  })
})

const statCards = computed(() => [
  { label: "Total",     value: bookingsStore.bookings.length,           color: "bg-brand-50 text-brand-700" },
  { label: "Pending",   value: bookingsStore.statusCounts.pending,      color: "bg-yellow-50 text-yellow-700" },
  { label: "Confirmed", value: bookingsStore.statusCounts.confirmed,    color: "bg-green-50 text-green-700" },
  { label: "Cancelled", value: bookingsStore.statusCounts.cancelled,    color: "bg-red-50 text-red-700" },
])

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Header -->
    <div>
      <h1 class="font-heading text-2xl font-bold text-dark-900">Bookings</h1>
      <p class="mt-0.5 text-sm text-dark-400">Track and manage all tour bookings</p>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        :class="['rounded-xl p-4', card.color]">
        <p class="font-heading text-2xl font-bold">{{ card.value }}</p>
        <p class="mt-0.5 text-xs font-medium">{{ card.label }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      <!-- Search -->
      <div class="relative flex-1 min-w-48">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
        <input
          v-model="search"
          type="search"
          placeholder="Search customer, email, tour…"
          class="w-full rounded-xl border border-dark-200 bg-white py-2.5 pl-9 pr-4 text-sm text-dark-700 placeholder-dark-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
      </div>

      <!-- Status filter -->
      <div class="flex items-center gap-2">
        <FunnelIcon class="h-4 w-4 text-dark-400 flex-shrink-0" />
        <select
          v-model="statusFilter"
          class="rounded-xl border border-dark-200 bg-white px-3 py-2.5 text-sm text-dark-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100">
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <!-- Date range -->
      <div class="flex items-center gap-2">
        <CalendarIcon class="h-4 w-4 text-dark-400 flex-shrink-0" />
        <input
          v-model="dateFrom"
          type="date"
          class="rounded-xl border border-dark-200 bg-white px-3 py-2.5 text-sm text-dark-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
        <span class="text-sm text-dark-400">to</span>
        <input
          v-model="dateTo"
          type="date"
          class="rounded-xl border border-dark-200 bg-white px-3 py-2.5 text-sm text-dark-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-2xl border border-dark-100 bg-white shadow-sm">
      <!-- Loading -->
      <div v-if="bookingsStore.loading" class="flex items-center justify-center py-20">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <CalendarIcon class="h-12 w-12 text-dark-200" />
        <p class="mt-3 text-sm text-dark-400">No bookings found</p>
      </div>

      <!-- Table -->
      <table v-else class="w-full text-sm">
        <thead class="border-b border-dark-100 bg-dark-50">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-dark-500">Customer</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 md:table-cell">Tour</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 sm:table-cell">Travel Date</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 lg:table-cell">Pax</th>
            <th class="px-4 py-3 text-left font-semibold text-dark-500">Status</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 xl:table-cell">Booked On</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-dark-50">
          <tr
            v-for="booking in filtered"
            :key="booking.id"
            class="transition-colors hover:bg-brand-50/30">
            <td class="px-4 py-3">
              <p class="font-medium text-dark-900">{{ booking.customerName }}</p>
              <p class="text-xs text-dark-400">{{ booking.customerEmail }}</p>
            </td>
            <td class="hidden px-4 py-3 text-dark-600 md:table-cell">{{ booking.tourName }}</td>
            <td class="hidden px-4 py-3 text-dark-600 sm:table-cell">{{ formatDate(booking.travelDate) }}</td>
            <td class="hidden px-4 py-3 text-dark-500 lg:table-cell">
              {{ booking.adults }}A{{ booking.children > 0 ? ` · ${booking.children}C` : "" }}
            </td>
            <td class="px-4 py-3">
              <span :class="['inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', statusConfig[booking.status].classes]">
                {{ statusConfig[booking.status].label }}
              </span>
            </td>
            <td class="hidden px-4 py-3 text-xs text-dark-400 xl:table-cell">{{ formatDate(booking.createdAt) }}</td>
            <td class="px-4 py-3">
              <NuxtLink
                :to="`/dashboard/bookings/${booking.id}`"
                class="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline">
                View →
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
