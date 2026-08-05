/**
 * Canonical site + business facts. Single source of truth for SEO metadata,
 * structured data, and anything else that needs the real NAP details.
 * Keep in sync with components/global/TheFooter.vue.
 */

export const site = {
  name: "Trendzy Tours",
  legalName: "Trendzy Tours",
  tagline: "Your Journey, Our Promise",
  description:
    "India's trusted travel agency for domestic, international, cruise, and ladies-only holiday packages. Book from Nagpur with confidence.",
  /** Production origin. Overridden at runtime by NUXT_PUBLIC_SITE_URL. */
  url: "https://trendzytours.com",
  locale: "en_IN",
  logo: "/images/tours/logo/TrendzyTourslogo.png",
  /** TODO: replace with a purpose-built 1200x630 share image. */
  ogImage: "/images/tours/logo/TrendzyTourslogo.png",
  twitterHandle: "",
} as const

export const business = {
  phone: "+917123578454",
  phoneDisplay: "+91 712 3578454",
  email: "support@trendzytours.com",
  street: "Plot No. 24, \"Gopiraj,\" Vidya Vihar Colony, Pratap Nagar",
  city: "Nagpur",
  region: "Maharashtra",
  postalCode: "440022",
  country: "IN",
  /** Nagpur city centre — refine to the exact storefront coordinates. */
  latitude: 21.1458,
  longitude: 79.0882,
  priceRange: "₹₹",
  openingHours: "Mo-Sa 10:00-19:00",
  sameAs: [
    "https://facebook.com",
    "https://instagram.com",
  ],
} as const
