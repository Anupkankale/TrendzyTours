<script setup lang="ts">
import type { Tour } from "@/types/tour"

defineProps<{ tours: Tour[] }>()
</script>

<template>
  <div v-if="tours.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <ToursTourCard v-for="tour in tours" :key="tour.slug" :tour="tour" />
  </div>
  <div v-else class="py-16 text-center">
    <p class="text-gray-500">No tours found matching your filters.</p>
  </div>
</template>
