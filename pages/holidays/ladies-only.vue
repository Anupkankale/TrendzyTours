<script setup lang="ts">
useSeoMeta({
  title: "Ladies Only Tours | Trendzy Tours",
  description: "Safe, curated travel experiences exclusively for women. Ladies only holiday packages from Trendzy Tours, Nagpur.",
})
const { tours: ladiesOnly } = useTours({ category: "ladies-only", key: "ladies-live-tours" })

const features = [
  { emoji: "🛡️", title: "Safe & Secure", desc: "Women guides, women drivers, and carefully vetted accommodations." },
  { emoji: "👭", title: "Like-Minded Community", desc: "Travel with women who share your sense of adventure and curiosity." },
  { emoji: "🌸", title: "Pampering Included", desc: "Spa sessions, leisure time, and experiences chosen just for you." },
]
</script>

<template>
  <div>
    <section class="bg-dark-900 py-20">
      <div class="container-max px-4 text-center sm:px-6 lg:px-8">
        <UiAppBadge label="Women Exclusive" />
        <h1 class="mt-3 font-heading text-4xl font-bold text-white lg:text-5xl">Ladies Only Tours</h1>
        <p class="mx-auto mt-4 max-w-xl text-lg text-gray-300">
          Travel safely, confidently, and joyfully with our exclusive women-only holiday packages — designed with your comfort and security at heart.
        </p>
      </div>
    </section>
    <section class="section-padding bg-cream-100">
      <div class="container-max px-4 sm:px-6 lg:px-8">
        <div class="mb-10 grid gap-4 sm:grid-cols-3">
          <div v-for="feat in features" :key="feat.title" class="rounded-2xl bg-white p-5 text-center shadow-sm">
            <div class="mx-auto mb-3 text-3xl">{{ feat.emoji }}</div>
            <h3 class="font-heading font-semibold text-dark-900">{{ feat.title }}</h3>
            <p class="mt-1 text-sm text-gray-600">{{ feat.desc }}</p>
          </div>
        </div>
        <ToursTourGrid :tours="ladiesOnly ?? []" />
      </div>
    </section>
  </div>
</template>
