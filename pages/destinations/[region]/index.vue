<script setup lang="ts">
import { regions } from "@/data/destinations"

const route = useRoute()
const region = regions.find((r) => r.slug === route.params.region)

if (!region) throw createError({ statusCode: 404, statusMessage: "Region not found" })
const { tours: regionTours } = useTours({ region: region.slug, key: `region-${region.slug}-live-tours` })

useSeoMeta({
  title: `${region.name} Tour Packages | Trendzy Tours`,
  description: `Explore ${region.name} with Trendzy Tours. Handpicked holiday packages to ${region.featured.slice(0, 3).join(", ")} and more.`,
})
</script>

<template>
  <div>
    <section class="bg-dark-900 py-20">
      <div class="container-max px-4 text-center sm:px-6 lg:px-8">
        <p class="mb-3 text-sm font-semibold uppercase tracking-widest text-gold-400">Destination</p>
        <h1 class="font-heading text-4xl font-bold text-white lg:text-5xl">{{ region.name }}</h1>
        <p class="mx-auto mt-4 max-w-xl text-lg text-gray-300">{{ region.description }}</p>
        <div class="mt-5 flex flex-wrap justify-center gap-2">
          <span
            v-for="dest in region.featured"
            :key="dest"
            class="rounded-full bg-dark-800 px-3 py-1 text-sm text-gray-300">
            {{ dest }}
          </span>
        </div>
      </div>
    </section>
    <section class="section-padding bg-white">
      <div class="container-max px-4 sm:px-6 lg:px-8">
        <template v-if="(regionTours?.length ?? 0) > 0">
          <UiAppSectionTitle :title="`${region.name} Tours`" :subtitle="`${regionTours?.length ?? 0} packages available`" />
          <ToursTourGrid :tours="regionTours ?? []" />
        </template>
        <div v-else class="py-16 text-center">
          <p class="text-gray-500">No tours currently available for this region. Please check back soon or contact us for custom packages.</p>
          <NuxtLink to="/contact" class="mt-6 inline-block rounded-full bg-gold-500 px-6 py-3 font-semibold text-white hover:bg-gold-600">
            Request Custom Tour
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
