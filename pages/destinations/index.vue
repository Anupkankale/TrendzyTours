<script setup lang="ts">
import { regions } from "@/data/destinations"

useSeoMeta({
  title: "Travel Destinations | Trendzy Tours",
  description: "Explore tour destinations by region — Asia, Europe, Africa, Oceania, Latin America, and North America with Trendzy Tours.",
})
</script>

<template>
  <div>
    <section class="bg-dark-900 py-20">
      <div class="container-max px-4 text-center sm:px-6 lg:px-8">
        <h1 class="font-heading text-4xl font-bold text-white lg:text-5xl">Explore Destinations</h1>
        <p class="mx-auto mt-4 max-w-xl text-lg text-gray-300">Six regions. Hundreds of destinations. One trusted partner.</p>
      </div>
    </section>
    <section class="section-padding bg-white">
      <div class="container-max px-4 sm:px-6 lg:px-8">
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="region in regions"
            :key="region.slug"
            :to="`/destinations/${region.slug}`"
            class="group relative overflow-hidden rounded-2xl shadow-md">
            <NuxtImg
              :src="region.image"
              :alt="region.name"
              class="h-72 w-full object-cover transition duration-500 group-hover:scale-110"
              :width="600"
              :height="400"
              loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />
            <div class="absolute bottom-0 left-0 p-6">
              <h2 class="font-heading text-2xl font-bold text-white">{{ region.name }}</h2>
              <p class="mt-1 text-sm text-gray-300">{{ region.description }}</p>
              <div class="mt-3 flex flex-wrap gap-1">
                <span
                  v-for="dest in region.featured.slice(0, 4)"
                  :key="dest"
                  class="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                  {{ dest }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
