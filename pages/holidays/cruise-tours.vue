<script setup lang="ts">
useSeoMeta({
  title: "Cruise Tour Packages | Trendzy Tours",
  description: "Luxury and river cruise packages from Trendzy Tours. Mediterranean, Caribbean, and river cruises for Indian travellers.",
})
const { tours: cruises } = useTours({ category: "cruise", key: "cruise-live-tours" })
</script>

<template>
  <div>
    <section class="bg-dark-900 py-20">
      <div class="container-max px-4 text-center sm:px-6 lg:px-8">
        <UiAppBadge label="Cruise Tours" />
        <h1 class="mt-3 font-heading text-4xl font-bold text-white lg:text-5xl">Cruise Tours</h1>
        <p class="mx-auto mt-4 max-w-xl text-lg text-gray-300">
          Wake up to a new paradise every morning. Luxury cruises across the Mediterranean, Caribbean, and beyond.
        </p>
      </div>
    </section>
    <section class="section-padding bg-white">
      <div class="container-max px-4 sm:px-6 lg:px-8">
        <ToursTourGrid :tours="cruises ?? []" />
      </div>
    </section>
  </div>
</template>
