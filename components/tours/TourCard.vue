<script setup lang="ts">
import { HeartIcon } from "@heroicons/vue/24/outline"
import { HeartIcon as HeartSolidIcon, StarIcon } from "@heroicons/vue/24/solid"
import type { Tour } from "@/types/tour"
import { useToursStore } from "@/stores/tours"

const props = defineProps<{ tour: Tour }>()
const store = useToursStore()
</script>

<template>
  <div class="glass-card group flex flex-col overflow-hidden rounded-2xl">
    <!-- Image wrapper -->
    <div class="relative overflow-hidden">
      <NuxtLink :to="`/tours/${tour.slug}`" class="block">
        <NuxtImg
          :src="tour.heroImage"
          :alt="tour.name"
          class="h-56 w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
          :width="600"
          :height="400"
          loading="lazy" />
        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-brand-950/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <!-- Hover CTA -->
        <div class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span class="rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-brand-700 shadow-lg backdrop-blur-sm">
            View Details
          </span>
        </div>
      </NuxtLink>

      <!-- Wishlist -->
      <button
        class="absolute right-3 top-3 rounded-full bg-white/85 p-2 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white"
        :aria-label="store.isInWishlist(tour.slug) ? 'Remove from wishlist' : 'Add to wishlist'"
        @click.prevent="store.toggleWishlist(tour.slug)">
        <HeartSolidIcon v-if="store.isInWishlist(tour.slug)" class="h-4 w-4 text-red-500" />
        <HeartIcon v-else class="h-4 w-4 text-dark-400" />
      </button>

      <!-- Duration badge -->
      <div class="absolute left-3 top-3">
        <UiAppBadge :label="tour.duration + ' Nights'" />
      </div>
    </div>

    <!-- Card body -->
    <div class="flex flex-1 flex-col p-5">
      <!-- Destination label -->
      <p class="text-xs font-semibold uppercase tracking-wider text-brand-500">{{ tour.destination }}</p>

      <!-- Tour name -->
      <h3 class="mt-1.5 font-heading text-lg font-semibold leading-snug text-heading">{{ tour.name }}</h3>

      <!-- Description -->
      <p class="mt-2 flex-1 line-clamp-2 text-sm leading-relaxed text-muted">{{ tour.shortDescription }}</p>

      <!-- Rating placeholder -->
      <div class="mt-3 flex items-center gap-1">
        <StarIcon v-for="i in 5" :key="i" :class="['h-3.5 w-3.5', i <= 4 ? 'text-amber-400' : 'text-dark-200']" />
        <span class="ml-1 text-xs text-muted">(4.8)</span>
      </div>

      <!-- Divider -->
      <div class="my-4 h-px bg-gradient-to-r from-transparent via-brand-100 to-transparent" />

      <!-- Price + CTA -->
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs text-subtle">From</span>
          <div class="font-heading text-2xl font-bold leading-none text-brand-600">
            ₹{{ tour.pricePerPerson.toLocaleString("en-IN") }}
          </div>
          <span class="text-xs text-subtle">/ person</span>
        </div>
        <NuxtLink
          :to="`/tours/${tour.slug}`"
          class="group/btn inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-600 hover:shadow-md">
          Book Now
          <svg class="h-3.5 w-3.5 transition-transform duration-150 group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
