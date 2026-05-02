<script setup lang="ts">
useSeoMeta({
  title: "Holiday Packages | Trendzy Tours",
  description: "Browse all holiday packages — domestic, international, cruise, and ladies-only tours from Trendzy Tours, Nagpur.",
})

const { tours } = useTours({ key: "all-live-tours" })

const categories = [
  { slug: "domestic", label: "Domestic", description: "Explore the best of India", href: "/holidays/domestic" },
  { slug: "world-travellers", label: "World Travellers", description: "International tours for every budget", href: "/holidays/world-travellers" },
  { slug: "cruise", label: "Cruise Tours", description: "Luxury voyages across the seas", href: "/holidays/cruise-tours" },
  { slug: "ladies-only", label: "Ladies Only", description: "Safe, curated travel for women", href: "/holidays/ladies-only" },
]
</script>

<template>
  <div>
    <section class="bg-dark-900 py-20">
      <div class="container-max px-4 text-center sm:px-6 lg:px-8">
        <h1 class="font-heading text-4xl font-bold text-white lg:text-5xl">Our Holiday Packages</h1>
        <p class="mx-auto mt-4 max-w-xl text-lg text-gray-300">
          Find your perfect escape — from serene domestic getaways to epic world tours.
        </p>
      </div>
    </section>
    <section class="section-padding bg-white">
      <div class="container-max px-4 sm:px-6 lg:px-8">
        <div class="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.slug"
            :to="cat.href"
            class="group rounded-2xl border-2 border-transparent bg-cream-100 p-6 text-center transition hover:border-gold-400 hover:bg-white hover:shadow-md">
            <h2 class="font-heading text-xl font-bold text-dark-900">{{ cat.label }}</h2>
            <p class="mt-2 text-sm text-gray-600">{{ cat.description }}</p>
            <span class="mt-4 inline-block text-sm font-semibold text-gold-600 group-hover:underline">Browse →</span>
          </NuxtLink>
        </div>
        <UiAppSectionTitle title="All Tours" />
        <ToursTourGrid :tours="tours ?? []" />
      </div>
    </section>
  </div>
</template>
