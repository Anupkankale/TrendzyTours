<script setup lang="ts">
useSeoMeta({
  title: "Domestic Holiday Packages | Trendzy Tours",
  description: "Explore India with our handcrafted domestic tour packages. Rajasthan, Sikkim, Kerala, and more from Nagpur.",
})
const { tours: domestic } = useTours({ category: "domestic", key: "domestic-live-tours" })
</script>

<template>
  <div>
    <section class="bg-dark-900 py-20">
      <div class="container-max px-4 text-center sm:px-6 lg:px-8">
        <UiAppBadge label="Domestic Tours" />
        <h1 class="mt-3 font-heading text-4xl font-bold text-white lg:text-5xl">Explore India</h1>
        <p class="mx-auto mt-4 max-w-xl text-lg text-gray-300">
          From the golden deserts of Rajasthan to the lush valleys of Sikkim — discover the incredible diversity of India.
        </p>
      </div>
    </section>
    <section class="section-padding bg-white">
      <div class="container-max px-4 sm:px-6 lg:px-8">
        <ToursTourGrid :tours="domestic ?? []" />
      </div>
    </section>
  </div>
</template>
