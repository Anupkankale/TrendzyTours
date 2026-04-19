<script setup lang="ts">
import { useContactForm } from "@/composables/useContactForm"
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from "@heroicons/vue/24/outline"

useSeoMeta({
  title: "Contact Us | Trendzy Tours",
  description: "Get in touch with Trendzy Tours, Nagpur. Call, email, or fill our inquiry form to plan your perfect holiday.",
})

const { name, nameProps, email, emailProps, phone, phoneProps, tourInterest, tourInterestProps, message, messageProps, errors, isSubmitting, isSuccess, serverError, submit } =
  useContactForm()
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-dark-900 py-20">
      <div class="container-max px-4 text-center sm:px-6 lg:px-8">
        <h1 class="font-heading text-4xl font-bold text-white lg:text-5xl">Contact Us</h1>
        <p class="mx-auto mt-4 max-w-xl text-lg text-gray-300">
          Have questions? Ready to book? Our travel experts are here to help.
        </p>
      </div>
    </section>

    <!-- Contact section -->
    <section class="section-padding bg-white">
      <div class="container-max grid gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <!-- Contact info -->
        <div>
          <UiAppSectionTitle title="Get in Touch" subtitle="We'd love to hear from you and help plan your dream holiday." />
          <ul class="space-y-6">
            <li class="flex gap-4">
              <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold-100">
                <MapPinIcon class="h-5 w-5 text-gold-600" />
              </div>
              <div>
                <p class="font-semibold text-dark-900">Address</p>
                <p class="mt-1 text-sm text-gray-600">Plot No. 24, "Gopiraj," Vidya Vihar Colony, Pratap Nagar, Nagpur 440022</p>
              </div>
            </li>
            <li class="flex gap-4">
              <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold-100">
                <PhoneIcon class="h-5 w-5 text-gold-600" />
              </div>
              <div>
                <p class="font-semibold text-dark-900">Phone</p>
                <a href="tel:+917123578454" class="mt-1 text-sm text-gold-600 hover:underline">+91 712 3578454</a>
              </div>
            </li>
            <li class="flex gap-4">
              <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold-100">
                <EnvelopeIcon class="h-5 w-5 text-gold-600" />
              </div>
              <div>
                <p class="font-semibold text-dark-900">Email</p>
                <a href="mailto:support@trendzytours.com" class="mt-1 text-sm text-gold-600 hover:underline">support@trendzytours.com</a>
              </div>
            </li>
          </ul>
          <div class="mt-8">
            <a
              href="https://wa.me/917123578454?text=Hi%2C%20I%27d%20like%20to%20enquire%20about%20a%20tour"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 font-semibold text-white shadow transition hover:bg-green-600">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <!-- Form -->
        <div class="rounded-2xl bg-cream-100 p-8">
          <div v-if="isSuccess" class="py-8 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 class="font-heading text-xl font-bold text-dark-900">Message Sent!</h3>
            <p class="mt-2 text-gray-600">Thank you! Our team will get back to you within 24 hours.</p>
          </div>
          <form v-else class="space-y-5" @submit.prevent="submit">
            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-dark-900">Full Name *</label>
                <input v-bind="nameProps" v-model="name" type="text" placeholder="Your name" class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200" />
                <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-dark-900">Phone *</label>
                <input v-bind="phoneProps" v-model="phone" type="tel" placeholder="+91 XXXXX XXXXX" class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200" />
                <p v-if="errors.phone" class="mt-1 text-xs text-red-500">{{ errors.phone }}</p>
              </div>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-dark-900">Email *</label>
              <input v-bind="emailProps" v-model="email" type="email" placeholder="your@email.com" class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200" />
              <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-dark-900">Tour of Interest</label>
              <input v-bind="tourInterestProps" v-model="tourInterest" type="text" placeholder="e.g. Bali, Europe, Rajasthan" class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-dark-900">Message *</label>
              <textarea v-bind="messageProps" v-model="message" rows="4" placeholder="Tell us about your travel plans, dates, group size..." class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200" />
              <p v-if="errors.message" class="mt-1 text-xs text-red-500">{{ errors.message }}</p>
            </div>
            <p v-if="serverError" class="text-sm text-red-500">{{ serverError }}</p>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full rounded-full bg-gold-500 py-3 font-semibold text-white shadow transition hover:bg-gold-600 disabled:opacity-60">
              {{ isSubmitting ? "Sending…" : "Send Inquiry" }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
