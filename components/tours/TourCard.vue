 <script setup lang="ts">
import { HeartIcon, PhotoIcon, UserGroupIcon } from "@heroicons/vue/24/outline"
import { HeartIcon as HeartSolidIcon } from "@heroicons/vue/24/solid"
import type { Tour } from "@/types/tour"
import { useToursStore } from "@/stores/tours"

const props = defineProps<{ tour: Tour }>()
const store = useToursStore()

// Remote hero images can 404 (Unsplash IDs get retired) — fall back to a
// branded placeholder instead of the browser's broken-image glyph.
const imageFailed = ref(false)
watch(() => props.tour.heroImage, () => { imageFailed.value = false })

const titleId = computed(() => `tour-title-${props.tour.slug}`)
const price = computed(() => props.tour.pricePerPerson.toLocaleString("en-IN"))
const wishlisted = computed(() => store.isInWishlist(props.tour.slug))
</script>

<template>
  <article
    :aria-labelledby="titleId"
    class="glass-card group relative flex flex-col overflow-hidden rounded-2xl focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2">
    <!-- Image wrapper: fixed ratio reserves space so the grid never reflows -->
    <div class="relative aspect-[3/2] overflow-hidden bg-dark-100">
      <NuxtImg
        v-if="!imageFailed"
        :src="tour.heroImage"
        :alt="`${tour.name} — ${tour.destination}`"
        class="h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
        :width="600"
        :height="400"
        loading="lazy"
        decoding="async"
        @error="imageFailed = true" />

      <!-- Fallback: keeps the card intact when the remote image is gone -->
      <div
        v-else
        class="flex h-full w-full flex-col items-center justify-center gap-2 bg-brand-gradient px-4 text-center">
        <PhotoIcon class="h-8 w-8 text-white/70" />
        <span class="font-heading text-sm font-semibold text-white/90">{{ tour.destination }}</span>
      </div>

      <!-- Decorative hover/focus affordance -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100" />
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
        <span class="rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-brand-700 shadow-lg backdrop-blur-sm">
          View Details
        </span>
      </div>

      <!-- Wishlist — above the stretched link, 44px touch target -->
      <button
        type="button"
        :aria-pressed="wishlisted"
        :aria-label="`${wishlisted ? 'Remove' : 'Add'} ${tour.name} ${wishlisted ? 'from' : 'to'} wishlist`"
        class="absolute right-2.5 top-2.5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/85 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white"
        @click="store.toggleWishlist(tour.slug)">
        <HeartSolidIcon v-if="wishlisted" class="h-5 w-5 text-red-500" />
        <HeartIcon v-else class="h-5 w-5 text-dark-400" />
      </button>

      <!-- Duration badge -->
      <div class="pointer-events-none absolute left-3 top-3">
        <UiAppBadge :label="`${tour.duration} Nights`" />
      </div>
    </div>

    <!-- Card body -->
    <div class="flex flex-1 flex-col p-5">
      <p class="text-xs font-semibold uppercase tracking-wider text-brand-500">{{ tour.destination }}</p>

      <h3 :id="titleId" class="mt-1.5 break-words font-heading text-lg font-semibold leading-snug text-heading">
        {{ tour.name }}
      </h3>

      <p class="mt-2 flex-1 line-clamp-2 text-sm leading-relaxed text-muted">{{ tour.shortDescription }}</p>

      <!-- Real trip facts (replaces the hard-coded 4.8 star placeholder) -->
      <p class="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <UserGroupIcon class="h-4 w-4 shrink-0 text-dark-400" aria-hidden="true" />
        <span>{{ tour.groupSize.min }}–{{ tour.groupSize.max }} guests</span>
      </p>

      <div aria-hidden="true" class="my-4 h-px bg-gradient-to-r from-transparent via-brand-100 to-transparent" />

      <div class="flex items-center justify-between gap-3">
        <p class="leading-none">
          <span class="text-xs text-subtle">From</span>
          <span class="mt-0.5 block font-heading text-2xl font-bold text-brand-600">
            ₹{{ price }}<span class="sr-only"> per person</span>
          </span>
          <span aria-hidden="true" class="text-xs text-subtle">/ person</span>
        </p>

        <!-- Single stretched link: whole card is clickable, one tab stop -->
        <NuxtLink
          :to="`/tours/${tour.slug}`"
          :aria-label="`View ${tour.name} tour details`"
          class="group/btn inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 after:absolute after:inset-0 after:content-[''] hover:bg-brand-600 hover:shadow-md">
          Book Now
          <svg aria-hidden="true" class="h-3.5 w-3.5 transition-transform duration-150 group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
