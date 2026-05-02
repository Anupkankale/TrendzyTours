<script setup lang="ts">
import type { TourFormInput } from "@/types/tour"

definePageMeta({ layout: "dashboard", middleware: ["auth", "role"], meta: { roles: ["admin"] } })

const toursStore = useToursStore()
const submitting = ref(false)

async function createTour(payload: TourFormInput) {
  submitting.value = true
  try {
    await toursStore.createDashboardTour(payload)
    await navigateTo("/dashboard/tours")
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6 p-6">
    <div>
      <h1 class="font-heading text-2xl font-bold text-dark-900">Create Tour</h1>
      <p class="mt-0.5 text-sm text-dark-400">Add a new package, itinerary, and publishing status.</p>
    </div>

    <div class="rounded-3xl border border-dark-100 bg-cream-50 p-6 shadow-sm">
      <DashboardTourForm :submitting="submitting" submit-label="Create Tour" @submit="createTour" />
    </div>
  </div>
</template>
