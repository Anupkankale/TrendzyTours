<script setup lang="ts">
import { regions } from "@/data/destinations"
</script>

<template>
  <section class="section-padding">
    <div class="container-max">
      <UiAppSectionTitle
        eyebrow="Explore the World"
        title="Explore by Region"
        subtitle="Six continents, countless adventures. Where will you go next?"
        center />

      <!-- Grid: first item spans 2 rows on lg for visual interest -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="(region, index) in regions"
          :key="region.slug"
          :to="`/destinations/${region.slug}`"
          :class="[
            'group relative overflow-hidden rounded-2xl shadow-glass',
            index === 0 ? 'sm:row-span-2' : '',
          ]">
          <NuxtImg
            :src="region.image"
            :alt="region.name"
            :class="[
              'w-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-110',
              index === 0 ? 'h-full min-h-[320px]' : 'h-56',
            ]"
            :width="600"
            :height="index === 0 ? 800 : 400"
            loading="lazy" />

          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-900/20 to-transparent transition-opacity duration-300 group-hover:from-brand-950/90" />

          <!-- Content -->
          <div class="absolute bottom-0 left-0 right-0 p-5 transition-transform duration-300 group-hover:translate-y-0">
            <!-- Destination count badge -->
            <span class="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm ring-1 ring-white/20">
              <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {{ region.countryCount }} destinations
            </span>
            <h3 class="font-heading text-xl font-bold text-white">{{ region.name }}</h3>
            <p class="mt-1 text-sm text-white/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {{ region.description }}
            </p>
          </div>

          <!-- Arrow on hover -->
          <div class="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/0 ring-1 ring-white/0 transition-all duration-300 group-hover:bg-white/20 group-hover:ring-white/30">
            <svg class="h-4 w-4 translate-x-1 translate-y-[-1px] rotate-[-45deg] text-white opacity-0 transition-all duration-300 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
