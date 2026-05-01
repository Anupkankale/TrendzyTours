<script setup lang="ts">
import { FunnelIcon, MagnifyingGlassIcon, PencilSquareIcon, PlusIcon } from "@heroicons/vue/24/outline"
import type { Tour, TourCategory } from "@/types/tour"

definePageMeta({ layout: "dashboard", middleware: ["auth", "role"], meta: { roles: ["admin"] } })

const toursStore = useToursStore()

const search = ref("")
const categoryFilter = ref<TourCategory | "all">("all")
const statusFilter = ref<"all" | "published" | "draft">("all")
const togglingId = ref<string | null>(null)

const categoryOptions: { value: TourCategory | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "domestic", label: "Domestic" },
  { value: "world-travellers", label: "World Travellers" },
  { value: "cruise", label: "Cruise" },
  { value: "ladies-only", label: "Ladies Only" },
]

onMounted(() => toursStore.fetchDashboardTours())

const filteredTours = computed(() => toursStore.dashboardTours.filter((tour) => {
  if (categoryFilter.value !== "all" && tour.category !== categoryFilter.value) return false
  if (statusFilter.value === "published" && !tour.publishedAt) return false
  if (statusFilter.value === "draft" && tour.publishedAt) return false

  const query = search.value.trim().toLowerCase()
  if (!query) return true

  return [tour.name, tour.slug, tour.destination, tour.region].some((value) => value.toLowerCase().includes(query))
}))

const stats = computed(() => [
  { label: "Total Tours", value: toursStore.dashboardTours.length, classes: "bg-brand-50 text-brand-700" },
  { label: "Live", value: toursStore.dashboardTours.filter((tour) => tour.publishedAt).length, classes: "bg-green-50 text-green-700" },
  { label: "Not Live", value: toursStore.dashboardTours.filter((tour) => !tour.publishedAt).length, classes: "bg-yellow-50 text-yellow-700" },
  { label: "Featured", value: toursStore.dashboardTours.filter((tour) => tour.featured).length, classes: "bg-gold-100 text-gold-700" },
])

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function statusBadgeClasses(tour: Tour) {
  return tour.publishedAt
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700"
}

async function toggleStatus(tour: Tour) {
  togglingId.value = tour.id
  try {
    await toursStore.updateDashboardTour(tour.id, {
      publishedAt: tour.publishedAt ? null : new Date().toISOString().slice(0, 10),
    })
  } finally {
    togglingId.value = null
  }
}
</script>

<template>
  <div class="space-y-6 p-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-heading text-2xl font-bold text-dark-900">Tours</h1>
        <p class="mt-0.5 text-sm text-dark-400">Manage packages, pricing, and whether a tour is live on the public site.</p>
      </div>
      <NuxtLink
        to="/dashboard/tours/create"
        class="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600">
        <PlusIcon class="h-4 w-4" />
        New Tour
      </NuxtLink>
    </div>

    <div class="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <div v-for="card in stats" :key="card.label" :class="['rounded-xl p-4', card.classes]">
        <p class="font-heading text-2xl font-bold">{{ card.value }}</p>
        <p class="mt-0.5 text-xs font-medium">{{ card.label }}</p>
      </div>
    </div>

    <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div class="relative flex-1 min-w-48">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
        <input
          v-model="search"
          type="search"
          placeholder="Search title, slug, destination..."
          class="w-full rounded-xl border border-dark-200 bg-white py-2.5 pl-9 pr-4 text-sm text-dark-700 placeholder-dark-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
      </div>

      <div class="flex items-center gap-2">
        <FunnelIcon class="h-4 w-4 text-dark-400" />
        <select v-model="categoryFilter" class="rounded-xl border border-dark-200 bg-white px-3 py-2.5 text-sm text-dark-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100">
          <option v-for="option in categoryOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>

      <select v-model="statusFilter" class="rounded-xl border border-dark-200 bg-white px-3 py-2.5 text-sm text-dark-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100">
        <option value="all">All Statuses</option>
        <option value="published">Live</option>
        <option value="draft">Not Live</option>
      </select>
    </div>

    <div class="overflow-hidden rounded-2xl border border-dark-100 bg-white shadow-sm">
      <div v-if="toursStore.dashboardLoading" class="flex items-center justify-center py-20">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>

      <div v-else-if="filteredTours.length === 0" class="py-20 text-center">
        <p class="text-sm text-dark-400">No tours matched the current filters.</p>
      </div>

      <table v-else class="w-full text-sm">
        <thead class="border-b border-dark-100 bg-dark-50">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-dark-500">Title</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 md:table-cell">Category</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 lg:table-cell">Price</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 lg:table-cell">Destination</th>
            <th class="px-4 py-3 text-left font-semibold text-dark-500">Status</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 xl:table-cell">Updated</th>
            <th class="px-4 py-3 text-right font-semibold text-dark-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-dark-50">
          <tr v-for="tour in filteredTours" :key="tour.id" class="hover:bg-brand-50/20">
            <td class="px-4 py-3 align-top">
              <p class="font-medium text-dark-900">{{ tour.name }}</p>
              <p class="text-xs text-dark-400">{{ tour.slug }}</p>
            </td>
            <td class="hidden px-4 py-3 text-dark-600 md:table-cell capitalize">{{ tour.category }}</td>
            <td class="hidden px-4 py-3 text-dark-600 lg:table-cell">{{ formatCurrency(tour.pricePerPerson) }}</td>
            <td class="hidden px-4 py-3 text-dark-600 lg:table-cell">{{ tour.destination }}</td>
            <td class="px-4 py-3">
              <button
                :disabled="togglingId === tour.id"
                :class="['inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold transition', statusBadgeClasses(tour)]"
                @click="toggleStatus(tour)">
                {{ tour.publishedAt ? "Live" : "Not Live" }}
              </button>
            </td>
            <td class="hidden px-4 py-3 text-dark-500 xl:table-cell">{{ formatDate(tour.updatedAt) }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end">
                <NuxtLink
                  :to="`/dashboard/tours/${tour.id}/edit`"
                  class="inline-flex items-center gap-1 rounded-lg border border-dark-200 px-3 py-1.5 text-xs font-medium text-dark-700 hover:bg-dark-50">
                  <PencilSquareIcon class="h-4 w-4" />
                  Edit
                </NuxtLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
