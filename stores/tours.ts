import { defineStore } from "pinia"
import type { Tour, TourCategory } from "@/types/tour"

interface TourFilters {
  category: TourCategory | null
  region: string | null
  maxPrice: number | null
  maxDuration: number | null
}

export const useToursStore = defineStore("tours", () => {
  const tourList = ref<Tour[]>([])
  const isLoading = ref(false)
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

  return { tourList, isLoading, wishlistIds, filters, filteredTours, featuredTours, isInWishlist, toggleWishlist, setFilter, clearFilters }
})
