<script setup lang="ts">
useSeoMeta({
  title: "About Us | Trendzy Tours",
  description:
    "Learn about Trendzy Tours — Nagpur's trusted travel agency with 15+ years of crafting unforgettable holiday experiences across India and the world.",
})

const values = [
  { icon: "🌍", title: "Passion for Travel", description: "We are travellers first. Our team has personally experienced the destinations we recommend." },
  { icon: "🛡️", title: "Trust & Transparency", description: "No hidden costs. What you see is what you pay — clear, honest pricing always." },
  { icon: "💎", title: "Quality Experiences", description: "Carefully selected hotels, guides, and itineraries that deliver genuine value and delight." },
  { icon: "❤️", title: "Customer First", description: "Your satisfaction is our success. We go above and beyond to make every trip exceptional." },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-dark-900 py-20">
      <div class="container-max px-4 text-center sm:px-6 lg:px-8">
        <h1 class="font-heading text-4xl font-bold text-white lg:text-5xl">About Trendzy Tours</h1>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
          15+ years of turning travel dreams into lifelong memories.
        </p>
      </div>
    </section>

    <!-- Story -->
    <section class="section-padding bg-white">
      <div class="container-max grid gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <UiAppSectionTitle title="Our Story" />
          <p class="text-gray-600 leading-relaxed">
            Founded in Nagpur, Trendzy Tours was born from a simple belief: that every journey should be as memorable as the destination itself. What started as a small boutique travel company has grown into one of Central India's most trusted travel agencies, serving thousands of happy travellers every year.
          </p>
          <p class="mt-4 text-gray-600 leading-relaxed">
            From the rice terraces of Bali to the sand dunes of Jaisalmer, from Norwegian fjords to Caribbean cruises — we have been the bridge between your travel dreams and extraordinary reality.
          </p>
          <p class="mt-4 text-gray-600 leading-relaxed">
            Our promise is simple: <strong class="text-dark-900">Your Journey, Our Promise</strong>. Every package we curate, every guide we deploy, every hotel we select is chosen with your comfort, safety, and delight in mind.
          </p>
        </div>
        <div class="flex flex-col gap-6">
          <div
            v-for="value in values"
            :key="value.title"
            class="flex gap-4 rounded-2xl bg-cream-100 p-5">
            <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gold-500 font-heading text-xl font-bold text-white">
              {{ value.icon }}
            </div>
            <div>
              <h3 class="font-heading font-semibold text-dark-900">{{ value.title }}</h3>
              <p class="mt-1 text-sm text-gray-600">{{ value.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="section-padding bg-gold-500">
      <div class="container-max px-4 text-center sm:px-6 lg:px-8">
        <h2 class="font-heading text-3xl font-bold text-white">Ready to Plan Your Next Adventure?</h2>
        <p class="mx-auto mt-4 max-w-xl text-white/90">Our travel experts are just a call away. Let us create your perfect holiday.</p>
        <div class="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <NuxtLink to="/contact" class="rounded-full bg-white px-8 py-3 font-semibold text-gold-700 shadow transition hover:bg-cream-100">
            Get in Touch
          </NuxtLink>
          <a href="tel:+917123578454" class="rounded-full border-2 border-white px-8 py-3 font-semibold text-white transition hover:bg-white/10">
            Call +91 712 3578454
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
