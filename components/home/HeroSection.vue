<template>
  <section class="relative flex min-h-screen items-center justify-center overflow-hidden">
    <!-- Background image -->
    <NuxtImg
      src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=90&auto=format&fit=crop"
      alt="Travel the world with Trendzy Tours"
      class="absolute inset-0 h-full w-full object-cover"
      fetchpriority="high"
      loading="eager"
      :width="1920"
      :height="1080" />

    <!-- Layered overlay for depth -->
    <div class="absolute inset-0 bg-gradient-to-br from-brand-950/75 via-brand-900/55 to-brand-800/40" />
    <div class="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent" />

    <!-- Decorative orb -->
    <div class="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl" />
    <div class="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-brand-300/10 blur-3xl" />

    <!-- Content -->
    <div class="container-max relative z-10 px-4 text-center sm:px-6 lg:px-8">

      <!-- Eyebrow badge -->
      <div class="mb-6 flex justify-center">
        <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-200 ring-1 ring-white/20 backdrop-blur-sm">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-300" />
          Trusted by 10,000+ Travellers
        </span>
      </div>

      <!-- Headline -->
      <h1 class="mx-auto max-w-5xl font-heading font-bold text-white">
        Your Next Adventure<br />
        <span class="bg-gradient-to-r from-brand-200 via-white to-brand-300 bg-clip-text text-transparent">
          Begins Here
        </span>
      </h1>

      <!-- Sub-copy -->
      <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
        Your Journey, Our Promise — domestic escapes, world tours, cruises, and ladies-only travel from Nagpur.
      </p>

      <!-- CTAs -->
      <div class="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <UiAppButton href="/holidays" size="lg" icon-right>
          Explore Holidays
        </UiAppButton>
        <UiAppButton href="/contact" variant="outline" size="lg">
          Talk to an Expert
        </UiAppButton>
      </div>

      <!-- Stats row -->
      <div class="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl ring-1 ring-white/15 backdrop-blur-sm sm:grid-cols-4">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          :class="[
            'flex flex-col items-center px-6 py-5',
            'bg-white/8 transition-colors duration-200 hover:bg-white/12',
            i < stats.length - 1 ? 'border-r-0 sm:border-r border-white/10' : '',
          ]">
          <span class="font-heading text-2xl font-bold text-white sm:text-3xl">{{ stat.value }}</span>
          <span class="mt-1 text-xs text-white/60">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/40">
      <span class="text-xs uppercase tracking-widest">Scroll</span>
      <div class="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
    </div>
  </section>
</template>

<script setup lang="ts">
const stats = [
  { value: "10K+", label: "Happy Travellers" },
  { value: "50+",  label: "Destinations" },
  { value: "15+",  label: "Years Experience" },
  { value: "24/7", label: "Travel Support" },
]
</script>
