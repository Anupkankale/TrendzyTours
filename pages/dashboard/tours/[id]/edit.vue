<script setup lang="ts">
import type { TourFormInput } from "@/types/tour"

definePageMeta({ layout: "dashboard", middleware: ["auth", "role"], meta: { roles: ["admin"] } })

const route = useRoute()
const toursStore = useToursStore()

const loading = ref(true)
const submitting = ref(false)
const initialValue = ref<TourFormInput | null>(null)

onMounted(async () => {
  const tour = await toursStore.fetchDashboardTour(route.params.id as string)
  if (!tour) {
    await navigateTo("/dashboard/tours")
    return
  }

  initialValue.value = {
    slug: tour.slug,
    name: tour.name,
    category: tour.category,
    region: tour.region,
    destination: tour.destination,
    duration: tour.duration,
    groupSize: { ...tour.groupSize },
    pricePerPerson: tour.pricePerPerson,
    heroImage: tour.heroImage,
    gallery: [...tour.gallery],
    shortDescription: tour.shortDescription,
    description: tour.description,
    seoDescription: tour.seoDescription,
    highlights: [...tour.highlights],
    inclusions: [...tour.inclusions],
    exclusions: [...tour.exclusions],
    itinerary: tour.itinerary.map((day) => ({ ...day, meals: [...day.meals] })),
    featured: tour.featured,
    publishedAt: tour.publishedAt || null,
  }
  loading.value = false
})

async function updateTour(payload: TourFormInput) {
  submitting.value = true
  try {
    await toursStore.updateDashboardTour(route.params.id as string, payload)
    await navigateTo("/dashboard/tours")
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6 p-6">
    <div>
      <h1 class="font-heading text-2xl font-bold text-dark-900">Edit Tour</h1>
      <p class="mt-0.5 text-sm text-dark-400">Update pricing, content, media, and status.</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
    </div>

    <div v-else-if="initialValue" class="rounded-3xl border border-dark-100 bg-cream-50 p-6 shadow-sm">
      <DashboardTourForm
        :initial-value="initialValue"
        :submitting="submitting"
        submit-label="Save Changes"
        @submit="updateTour" />
    </div>
  </div>
</template>
