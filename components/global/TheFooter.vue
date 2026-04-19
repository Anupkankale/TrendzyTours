<script setup lang="ts">
import { useNewsletterForm } from "@/composables/useNewsletterForm"

const { email, isSubmitting, isSuccess, error, subscribe } = useNewsletterForm()

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Domestic Holidays", href: "/holidays/domestic" },
  { label: "World Travellers", href: "/holidays/world-travellers" },
  { label: "Cruise Tours", href: "/holidays/cruise-tours" },
  { label: "Ladies Only Tours", href: "/holidays/ladies-only" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
]
</script>

<template>
  <footer class="bg-brand-900 text-brand-200">
    <div class="container-max section-padding grid gap-12 md:grid-cols-2 lg:grid-cols-4">
      <!-- Brand column -->
      <div>
        <p class="font-heading text-2xl font-bold text-white">
          Trendzy<span class="text-brand-300">Tours</span>
        </p>
        <p class="mt-3 text-sm leading-relaxed text-brand-200">
          Your Journey, Our Promise. Explore the world with confidence and care.
        </p>
        <div class="mt-6 flex gap-4">
          <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook" class="transition hover:text-white">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram" class="transition hover:text-white">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
          </a>
        </div>
      </div>

      <!-- Quick links -->
      <div>
        <h3 class="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h3>
        <ul class="space-y-2">
          <li v-for="link in quickLinks" :key="link.href">
            <NuxtLink :to="link.href" class="text-sm transition hover:text-white">{{ link.label }}</NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Contact -->
      <div>
        <h3 class="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-white">Contact Us</h3>
        <ul class="space-y-3 text-sm">
          <li class="leading-relaxed">
            Plot No. 24, "Gopiraj," Vidya Vihar Colony, Pratap Nagar, Nagpur 440022
          </li>
          <li>
            <a href="tel:+917123578454" class="transition hover:text-white">+91 712 3578454</a>
          </li>
          <li>
            <a href="mailto:support@trendzytours.com" class="transition hover:text-white">support@trendzytours.com</a>
          </li>
          <li>
            <a
              href="https://wa.me/917123578454?text=Hi%2C%20I%27d%20like%20to%20enquire%20about%20a%20tour"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-1.5 text-green-300 transition hover:text-green-200">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Chat on WhatsApp
            </a>
          </li>
        </ul>
      </div>

      <!-- Newsletter -->
      <div>
        <h3 class="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-white">Stay Inspired</h3>
        <p class="mb-4 text-sm">Get travel deals and destination guides delivered to your inbox.</p>
        <div v-if="!isSuccess">
          <form class="flex flex-col gap-2" @submit.prevent="subscribe">
            <input
              v-model="email"
              type="email"
              placeholder="Your email address"
              class="rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white placeholder-brand-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
            <button
              type="submit"
              :disabled="isSubmitting"
              class="rounded-xl bg-white py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-60">
              {{ isSubmitting ? "Subscribing…" : "Subscribe" }}
            </button>
          </form>
          <p v-if="error" class="mt-1 text-xs text-red-300">{{ error }}</p>
        </div>
        <p v-else class="text-sm text-green-300">Thanks for subscribing!</p>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-brand-800">
      <div class="container-max flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-brand-300 sm:flex-row sm:px-6 lg:px-8">
        <p>© {{ new Date().getFullYear() }} Trendzy Tours. All rights reserved.</p>
        <div class="flex gap-4">
          <NuxtLink to="/privacy-policy" class="transition hover:text-white">Privacy Policy</NuxtLink>
          <NuxtLink to="/terms" class="transition hover:text-white">Terms of Service</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
