<template>
  <section class="section-padding">
    <div class="container-max">
      <UiAppSectionTitle
        eyebrow="Limited Time"
        title="Special Offers"
        subtitle="Handpicked holiday deals with exclusive savings. Book before they're gone."
        center />

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="offer in offers"
          :key="offer.id"
          class="glass-card group relative flex flex-col overflow-hidden rounded-2xl">

          <!-- Image -->
          <div class="relative overflow-hidden">
            <NuxtImg
              :src="offer.image"
              :alt="offer.title"
              class="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              :width="600"
              :height="300"
              loading="lazy" />
            <!-- Gradient overlay on image -->
            <div class="absolute inset-0 bg-gradient-to-t from-brand-950/40 to-transparent" />

            <!-- Discount badge — top right -->
            <div class="absolute right-3 top-3">
              <span class="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                {{ offer.discount }}
              </span>
            </div>
          </div>

          <!-- Body -->
          <div class="flex flex-1 flex-col p-5">
            <h3 class="font-heading text-lg font-bold text-heading">{{ offer.title }}</h3>
            <p class="mt-1 text-sm text-muted">{{ offer.description }}</p>

            <!-- Price row -->
            <div class="mt-5 flex items-end justify-between">
              <div>
                <p class="text-xs text-subtle line-through">₹{{ offer.originalPrice.toLocaleString("en-IN") }}</p>
                <p class="font-heading text-2xl font-bold leading-none text-brand-600">
                  ₹{{ offer.salePrice.toLocaleString("en-IN") }}
                </p>
                <p class="mt-0.5 text-xs text-muted">per person</p>
              </div>
              <NuxtLink
                :to="offer.href"
                class="group/btn inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-brand-600 hover:shadow-lg">
                Book Now
                <svg class="h-3.5 w-3.5 transition-transform duration-150 group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </NuxtLink>
            </div>

            <!-- Savings callout -->
            <p class="mt-3 text-xs font-medium text-green-600">
              You save ₹{{ (offer.originalPrice - offer.salePrice).toLocaleString("en-IN") }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const offers = [
  {
    id: "1",
    title: "Bali Summer Escape",
    description: "7 nights with flights, breakfast & tours",
    originalPrice: 75000,
    salePrice: 65000,
    discount: "13% OFF",
    image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=600&q=85&auto=format&fit=crop",
    href: "/tours/bali-bliss-7-nights",
  },
  {
    id: "2",
    title: "Royal Rajasthan",
    description: "10 nights heritage experience",
    originalPrice: 50000,
    salePrice: 42000,
    discount: "16% OFF",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94373?w=600&q=85&auto=format&fit=crop",
    href: "/tours/rajasthan-royal-10-nights",
  },
  {
    id: "3",
    title: "Dubai Long Weekend",
    description: "5 nights with desert safari",
    originalPrice: 65000,
    salePrice: 55000,
    discount: "15% OFF",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=85&auto=format&fit=crop",
    href: "/tours/dubai-extravaganza-5-nights",
  },
]
</script>
