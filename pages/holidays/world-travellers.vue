<script setup lang="ts">
useSeoMeta({
  title: "International Holiday Packages | Trendzy Tours",
  description: "Explore the world with Trendzy Tours. International holiday packages to Europe, Asia, Africa, and beyond from Nagpur.",
})
const { tours: international } = useTours({ category: "world-travellers", key: "world-live-tours" })
</script>

<template>
  <div>
    <section class="bg-dark-900 py-20">
      <div class="container-max px-4 text-center sm:px-6 lg:px-8">
        <UiAppBadge label="International Tours" />
        <h1 class="mt-3 font-heading text-4xl font-bold text-white lg:text-5xl">World Travellers</h1>
        <p class="mx-auto mt-4 max-w-xl text-lg text-gray-300">
          Handcrafted international packages for every budget. Europe, Asia, Africa, and beyond — we take you there.
        </p>
      </div>
    </section>
    <section class="section-padding bg-white">
      <div class="container-max px-4 sm:px-6 lg:px-8">
        <ToursTourGrid :tours="international ?? []" />
      </div>
    </section>
  </div>
</template>
