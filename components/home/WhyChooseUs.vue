<script setup lang="ts">
import {
  ShieldCheckIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  StarIcon,
} from "@heroicons/vue/24/outline"

const reasons = [
  { icon: ShieldCheckIcon, title: "Guaranteed Experiences",    description: "We promise what we deliver. Every tour is crafted to exceed your expectations.", stat: "100%" },
  { icon: GlobeAltIcon,    title: "50+ Destinations",          description: "From North Sikkim to Santorini — we cover the world's most sought-after destinations.", stat: "50+" },
  { icon: UserGroupIcon,   title: "Expert Local Guides",       description: "Knowledgeable, friendly guides who make every destination come alive.", stat: "200+" },
  { icon: ClockIcon,       title: "24/7 Travel Support",       description: "Our team is always just a call away, wherever in the world you may be.", stat: "24/7" },
  { icon: CurrencyRupeeIcon, title: "Best Value Packages",     description: "Competitive pricing with transparent costs — no hidden charges, ever.", stat: "0 fees" },
  { icon: StarIcon,        title: "10,000+ Happy Travellers",  description: "A legacy of trust built on thousands of memorable journeys across India and the world.", stat: "4.9★" },
]
</script>

<template>
  <section class="section-padding relative overflow-hidden">
    <!-- Subtle background tint -->
    <div class="absolute inset-0 bg-gradient-to-br from-brand-50/60 via-transparent to-brand-50/30" />

    <div class="container-max relative">
      <UiAppSectionTitle
        eyebrow="Why Choose Us"
        title="Travel with Confidence"
        subtitle="We go beyond booking — we craft experiences that stay with you forever."
        center />

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(reason, index) in reasons"
          :key="reason.title"
          class="glass-card group relative flex flex-col rounded-2xl p-6 transition-all duration-300">

          <!-- Background number decoration -->
          <span class="absolute right-4 top-2 font-heading text-6xl font-bold text-brand-100 select-none transition-colors duration-300 group-hover:text-brand-200">
            {{ String(index + 1).padStart(2, '0') }}
          </span>

          <!-- Icon -->
          <div class="relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-brand-500/30 group-hover:shadow-lg">
            <component :is="reason.icon" class="h-6 w-6 text-white" />
          </div>

          <!-- Stat pill -->
          <span class="mb-3 inline-flex w-fit items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-600 ring-1 ring-brand-100">
            {{ reason.stat }}
          </span>

          <h3 class="font-heading text-lg font-semibold text-heading">{{ reason.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted">{{ reason.description }}</p>

          <!-- Bottom accent line on hover -->
          <div class="mt-4 h-0.5 w-0 rounded-full bg-brand-500 transition-all duration-300 group-hover:w-full" />
        </div>
      </div>
    </div>
  </section>
</template>
