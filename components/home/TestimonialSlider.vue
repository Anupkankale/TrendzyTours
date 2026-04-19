<script setup lang="ts">
import { testimonials } from "@/data/testimonials"
import { StarIcon } from "@heroicons/vue/20/solid"
</script>

<template>
  <section class="section-padding relative overflow-hidden bg-brand-600">
    <!-- Decorative blobs -->
    <div class="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl" />
    <div class="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-brand-800/30 blur-3xl" />
    <div class="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />

    <div class="container-max relative">
      <UiAppSectionTitle
        eyebrow="Testimonials"
        title="Happy Travellers Speak"
        subtitle="Real experiences from real people who trusted Trendzy Tours."
        center
        light />

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="t in testimonials"
          :key="t.id"
          class="group relative flex flex-col rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1"
          style="background: rgba(255,255,255,0.10); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.18);">

          <!-- Large decorative quote mark -->
          <span class="absolute right-5 top-3 font-heading text-7xl font-bold leading-none text-white/10 select-none">"</span>

          <!-- Stars -->
          <div class="mb-4 flex gap-0.5">
            <StarIcon
              v-for="i in 5"
              :key="i"
              :class="['h-4 w-4', i <= t.rating ? 'text-amber-300' : 'text-white/20']" />
          </div>

          <!-- Quote -->
          <p class="relative flex-1 text-sm leading-relaxed text-white/85">
            "{{ t.quote }}"
          </p>

          <!-- Divider -->
          <div class="my-4 h-px bg-white/10" />

          <!-- Author -->
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 font-heading text-sm font-bold text-white ring-2 ring-white/25">
              {{ t.avatarInitials }}
            </div>
            <div>
              <p class="text-sm font-semibold text-white">{{ t.name }}</p>
              <p class="text-xs text-white/55">{{ t.city }} · {{ t.tourName }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom CTA -->
      <div class="mt-12 flex justify-center">
        <NuxtLink
          to="/about"
          class="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-2.5 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors duration-200 hover:bg-white/25">
          Read more reviews
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
