<script setup lang="ts">
const { tours: featured } = useTours({ featured: true, key: "featured-tours" })
</script>

<template>
  <section class="section-padding">
    <div class="container-max">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <UiAppSectionTitle
          eyebrow="Handpicked For You"
          title="Featured Tours"
          subtitle="Our most loved holiday packages, curated by our travel experts." />
        <NuxtLink
          to="/holidays"
          class="group mb-12 hidden items-center gap-1.5 text-sm font-semibold text-brand-500 transition hover:text-brand-700 sm:inline-flex">
          View all holidays
          <svg class="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
      </div>
      <ToursTourGrid :tours="featured ?? []" />
      <!-- Mobile view-all -->
      <div class="mt-8 flex justify-center sm:hidden">
        <UiAppButton href="/holidays" variant="secondary" icon-right>View all holidays</UiAppButton>
      </div>
    </div>
  </section>
</template>
