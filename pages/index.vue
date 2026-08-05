<script setup lang="ts">
useSeo({
  title: "Trendzy Tours — Your Journey, Our Promise",
  titleRaw: true,
  description:
    "India's trusted travel agency for domestic, international, cruise, and ladies-only holiday packages. Book from Nagpur with confidence.",
})

// Organisation + site identity: emitted once, here, and referenced by @id elsewhere.
useJsonLd(travelAgencySchema(), webSiteSchema())
</script>

<template>
  <div>
    <HomeHeroSection />
    <HomeFeaturedTours />
    <HomeWhyChooseUs />
    <HomeDestinationGrid />
    <HomeTestimonialSlider />
    <HomeSpecialOffers />
  </div>
</template>
