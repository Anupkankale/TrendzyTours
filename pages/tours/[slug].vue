<script setup lang="ts">
import { tours } from "@/data/tours"
import { CheckCircleIcon, XCircleIcon, CalendarIcon, UsersIcon } from "@heroicons/vue/24/outline"
import { StarIcon } from "@heroicons/vue/20/solid"

const route = useRoute()
const tour = tours.find((t) => t.slug === route.params.slug)

if (!tour) throw createError({ statusCode: 404, statusMessage: "Tour not found" })

const openDay = ref<number | null>(null)

function toggleDay(day: number) {
  openDay.value = openDay.value === day ? null : day
}

useSeoMeta({
  title: `${tour.name} – ${tour.duration} Nights | Trendzy Tours`,
  description: tour.seoDescription,
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative h-[60vh] min-h-80 bg-dark-950">
      <div class="absolute inset-0 bg-dark-900/50" />
      <NuxtImg
        :src="tour.heroImage"
        :alt="tour.name"
        class="absolute inset-0 h-full w-full object-cover"
        fetchpriority="high"
        loading="eager"
        :width="1920"
        :height="800" />
      <div class="container-max relative z-10 flex h-full flex-col justify-end px-4 pb-10 sm:px-6 lg:px-8">
        <UiAppBadge :label="tour.category" class="mb-3" />
        <h1 class="font-heading text-4xl font-bold text-white lg:text-5xl">{{ tour.name }}</h1>
        <p class="mt-2 text-lg text-gray-200">{{ tour.destination }}</p>
      </div>
    </section>

    <!-- Content + sidebar -->
    <section class="section-padding bg-white">
      <div class="container-max grid gap-10 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        <!-- Main content -->
        <div class="lg:col-span-2">
          <!-- Quick stats -->
          <div class="mb-8 flex flex-wrap gap-4">
            <div class="flex items-center gap-2 rounded-xl bg-cream-100 px-4 py-2">
              <CalendarIcon class="h-5 w-5 text-gold-600" />
              <span class="text-sm font-medium">{{ tour.duration }} Nights</span>
            </div>
            <div class="flex items-center gap-2 rounded-xl bg-cream-100 px-4 py-2">
              <UsersIcon class="h-5 w-5 text-gold-600" />
              <span class="text-sm font-medium">{{ tour.groupSize.min }}–{{ tour.groupSize.max }} pax</span>
            </div>
          </div>

          <p class="text-gray-700 leading-relaxed">{{ tour.description }}</p>

          <!-- Highlights -->
          <div class="mt-8">
            <h2 class="font-heading text-xl font-bold text-dark-900">Tour Highlights</h2>
            <ul class="mt-4 grid gap-2 sm:grid-cols-2">
              <li v-for="h in tour.highlights" :key="h" class="flex items-start gap-2 text-sm text-gray-700">
                <StarIcon class="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-500" />
                {{ h }}
              </li>
            </ul>
          </div>

          <!-- Itinerary -->
          <div class="mt-10">
            <h2 class="font-heading text-xl font-bold text-dark-900">Day-by-Day Itinerary</h2>
            <div class="mt-4 space-y-3">
              <div
                v-for="day in tour.itinerary"
                :key="day.day"
                class="overflow-hidden rounded-xl border border-gray-200">
                <button
                  class="flex w-full items-center justify-between px-5 py-4 text-left"
                  @click="toggleDay(day.day)">
                  <span class="font-semibold text-dark-900">Day {{ day.day }}: {{ day.title }}</span>
                  <span class="text-gold-500 text-xl font-light">{{ openDay === day.day ? "−" : "+" }}</span>
                </button>
                <div v-if="openDay === day.day" class="border-t border-gray-100 px-5 py-4">
                  <p class="text-sm text-gray-700">{{ day.description }}</p>
                  <p v-if="day.meals.length" class="mt-2 text-xs text-gray-500">
                    Meals: {{ day.meals.join(", ") }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Inclusions & exclusions -->
          <div class="mt-10 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 class="font-heading text-xl font-bold text-dark-900">Inclusions</h2>
              <ul class="mt-4 space-y-2">
                <li v-for="inc in tour.inclusions" :key="inc" class="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircleIcon class="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  {{ inc }}
                </li>
              </ul>
            </div>
            <div>
              <h2 class="font-heading text-xl font-bold text-dark-900">Exclusions</h2>
              <ul class="mt-4 space-y-2">
                <li v-for="exc in tour.exclusions" :key="exc" class="flex items-start gap-2 text-sm text-gray-700">
                  <XCircleIcon class="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                  {{ exc }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Sticky sidebar -->
        <div class="lg:sticky lg:top-24 lg:self-start">
          <div class="rounded-2xl bg-cream-100 p-6 shadow-md">
            <p class="text-sm text-gray-500">Starting from</p>
            <p class="font-heading text-4xl font-bold text-gold-600">₹{{ tour.pricePerPerson.toLocaleString("en-IN") }}</p>
            <p class="text-sm text-gray-500">per person</p>
            <div class="my-6 space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-gray-600">Duration</span><span class="font-medium">{{ tour.duration }} Nights</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Group Size</span><span class="font-medium">{{ tour.groupSize.min }}–{{ tour.groupSize.max }} pax</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Destination</span><span class="font-medium">{{ tour.destination }}</span></div>
            </div>
            <NuxtLink
              :to="`/contact?tour=${encodeURIComponent(tour.name)}`"
              class="block w-full rounded-full bg-gold-500 py-3 text-center font-semibold text-white shadow transition hover:bg-gold-600">
              Book This Tour
            </NuxtLink>
            <a
              :href="`https://wa.me/917123578454?text=Hi%2C%20I%27d%20like%20to%20enquire%20about%20${encodeURIComponent(tour.name)}`"
              target="_blank"
              rel="noopener"
              class="mt-3 flex items-center justify-center gap-2 rounded-full border-2 border-green-500 py-3 text-center text-sm font-semibold text-green-600 transition hover:bg-green-50">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp Enquiry
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
