<script setup lang="ts">
useSeoMeta({
  title: "Terms of Service | Trendzy Tours",
  description:
    "Review the Trendzy Tours terms of service covering bookings, payments, cancellations, and your responsibilities as a traveller.",
})

const lastUpdated = "April 2026"
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-dark-900 py-20">
      <div class="container-max px-4 text-center sm:px-6 lg:px-8">
        <h1 class="font-heading text-4xl font-bold text-white lg:text-5xl">Terms of Service</h1>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
          Please review these terms before booking a tour with Trendzy Tours.
        </p>
        <p class="mt-3 text-sm text-gray-400">Last updated: {{ lastUpdated }}</p>
      </div>
    </section>

    <!-- Content -->
    <section class="section-padding bg-white">
      <div class="container-max max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 class="font-heading text-2xl font-bold text-dark-900">1. Agreement</h2>
          <p class="mt-3 leading-relaxed text-gray-600">
            By using trendzytours.com or booking a tour with Trendzy Tours, you agree to these
            terms. If you do not agree, please do not use the website or our services.
          </p>
        </div>

        <div>
          <h2 class="font-heading text-2xl font-bold text-dark-900">2. Bookings & Payments</h2>
          <p class="mt-3 leading-relaxed text-gray-600">
            A booking is confirmed only after we receive the required deposit and issue a written
            confirmation. Balance payments are due by the date specified in your booking invoice.
            All prices are in Indian Rupees unless otherwise stated and are subject to availability
            and currency fluctuations.
          </p>
        </div>

        <div>
          <h2 class="font-heading text-2xl font-bold text-dark-900">3. Cancellations & Refunds</h2>
          <p class="mt-3 leading-relaxed text-gray-600">
            Cancellation charges depend on the tour, supplier policies, and time of cancellation.
            Specific cancellation terms for each tour are shared at the time of booking. Refunds,
            where applicable, are processed to the original payment method within 10–15 business
            days after deductions.
          </p>
        </div>

        <div>
          <h2 class="font-heading text-2xl font-bold text-dark-900">4. Travel Documents & Insurance</h2>
          <p class="mt-3 leading-relaxed text-gray-600">
            Travellers are responsible for valid passports, visas, vaccinations, and any other
            documents required for the destination. We strongly recommend comprehensive travel
            insurance covering medical expenses, cancellations, and baggage loss.
          </p>
        </div>

        <div>
          <h2 class="font-heading text-2xl font-bold text-dark-900">5. Itinerary Changes</h2>
          <p class="mt-3 leading-relaxed text-gray-600">
            Itineraries may change due to weather, supplier availability, local regulations, or
            events outside our control. We will always seek reasonable alternatives of similar
            standard and notify you of changes as soon as possible.
          </p>
        </div>

        <div>
          <h2 class="font-heading text-2xl font-bold text-dark-900">6. Liability</h2>
          <p class="mt-3 leading-relaxed text-gray-600">
            Trendzy Tours acts as an agent for transport, accommodation, and other service
            providers. We are not liable for loss, injury, damage, or delay caused by third-party
            suppliers or events beyond our reasonable control.
          </p>
        </div>

        <div>
          <h2 class="font-heading text-2xl font-bold text-dark-900">7. Traveller Conduct</h2>
          <p class="mt-3 leading-relaxed text-gray-600">
            Travellers are expected to behave respectfully towards fellow guests, staff, and local
            communities. We reserve the right to remove travellers whose conduct endangers others
            or seriously disrupts the tour, with no refund.
          </p>
        </div>

        <div>
          <h2 class="font-heading text-2xl font-bold text-dark-900">8. Governing Law</h2>
          <p class="mt-3 leading-relaxed text-gray-600">
            These terms are governed by the laws of India. Any dispute arising from these terms or
            your booking is subject to the exclusive jurisdiction of the courts at Nagpur.
          </p>
        </div>

        <div>
          <h2 class="font-heading text-2xl font-bold text-dark-900">9. Contact</h2>
          <p class="mt-3 leading-relaxed text-gray-600">
            For any questions about these terms, contact us at
            <a href="mailto:support@trendzytours.com" class="text-gold-600 hover:text-gold-700">support@trendzytours.com</a>
            or call +91 712 3578454.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
