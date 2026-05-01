import { defineStore } from "pinia"
import type { Tour, TourCategory, TourFormInput } from "@/types/tour"

interface TourFilters {
  category: TourCategory | null
  region: string | null
  maxPrice: number | null
  maxDuration: number | null
}

export const useToursStore = defineStore("tours", () => {
  const { apiFetch } = useApi()
  const tourList = ref<Tour[]>([])
  const dashboardTours = ref<Tour[]>([])
  const isLoading = ref(false)
  const dashboardLoading = ref(false)
  const error = ref<string | null>(null)
  const wishlistIds = ref<string[]>([])
  const filters = ref<TourFilters>({ category: null, region: null, maxPrice: null, maxDuration: null })

  const filteredTours = computed(() => {
    return tourList.value.filter((t) => {
      if (filters.value.category && t.category !== filters.value.category) return false
      if (filters.value.region && t.region !== filters.value.region) return false
      if (filters.value.maxPrice && t.pricePerPerson > filters.value.maxPrice) return false
      if (filters.value.maxDuration && t.duration > filters.value.maxDuration) return false
      return true
    })
  })

  const featuredTours = computed(() => tourList.value.filter((t) => t.featured))

  function isInWishlist(slug: string) {
    return wishlistIds.value.includes(slug)
  }

  function toggleWishlist(slug: string) {
    const idx = wishlistIds.value.indexOf(slug)
    if (idx === -1) wishlistIds.value.push(slug)
    else wishlistIds.value.splice(idx, 1)
  }

  function setFilter<K extends keyof TourFilters>(key: K, value: TourFilters[K]) {
    filters.value[key] = value
  }

  function clearFilters() {
    filters.value = { category: null, region: null, maxPrice: null, maxDuration: null }
  }

  async function fetchDashboardTours() {
    dashboardLoading.value = true
    error.value = null
    try {
      dashboardTours.value = await apiFetch<Tour[]>("/api/admin/tours")
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load tours"
    } finally {
      dashboardLoading.value = false
    }
  }

  async function fetchDashboardTour(id: string): Promise<Tour | null> {
    try {
      return await apiFetch<Tour>(`/api/admin/tours/${id}`)
    } catch {
      return null
    }
  }

  async function createDashboardTour(data: TourFormInput): Promise<Tour> {
    const tour = await apiFetch<Tour>("/api/admin/tours", {
      method: "POST",
      body: data,
    })
    dashboardTours.value.unshift(tour)
    return tour
  }

  async function updateDashboardTour(id: string, data: Partial<TourFormInput>): Promise<Tour> {
    const tour = await apiFetch<Tour>(`/api/admin/tours/${id}`, {
      method: "PUT",
      body: data,
    })
    const index = dashboardTours.value.findIndex((item) => item.id === id)
    if (index >= 0) dashboardTours.value[index] = tour
    return tour
  }

  async function deleteDashboardTour(id: string) {
    try {
      await apiFetch(`/api/admin/tours/${id}`, { method: "DELETE" })
      dashboardTours.value = dashboardTours.value.filter((tour) => tour.id !== id)
    } catch (e: unknown) {
      if (e && typeof e === "object" && "data" in e) {
        const maybeData = (e as { data?: { message?: string } }).data
        if (maybeData?.message) throw new Error(maybeData.message)
      }
      throw e
    }
  }

  return {
    tourList,
    dashboardTours,
    isLoading,
    dashboardLoading,
    error,
    wishlistIds,
    filters,
    filteredTours,
    featuredTours,
    isInWishlist,
    toggleWishlist,
    setFilter,
    clearFilters,
    fetchDashboardTours,
    fetchDashboardTour,
    createDashboardTour,
    updateDashboardTour,
    deleteDashboardTour,
  }
})
