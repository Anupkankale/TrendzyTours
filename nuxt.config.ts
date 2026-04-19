export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  css: ["@/assets/css/tailwind.css"],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: [
    "@nuxt/image",
    "@nuxt/icon",
    "@nuxt/content",
    "@nuxtjs/google-fonts",
    "@pinia/nuxt",
    "@nuxt/eslint",
    "@nuxtjs/sitemap",
  ],

  googleFonts: {
    families: {
      "Playfair+Display": [400, 600, 700],
      Inter: [300, 400, 500, 600, 700],
    },
    display: "swap",
    preload: true,
  },

  image: {
    domains: ["trendzytours.com", "images.unsplash.com"],
    formats: ["webp", "avif"],
    quality: 85,
    screens: { xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280 },
  },

  content: {
    highlight: { theme: "github-light" },
    markdown: { anchorLinks: false },
  },

  pinia: {
    storesDirs: ["./stores/**"],
  },

  sitemap: {
    sitemaps: true,
    exclude: ["/dashboard/**", "/login"],
  },

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      meta: [
        { name: "theme-color", content: "#1e2028" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      ],
    },
  },

  typescript: {
    typeCheck: false,
    shim: false,
  },

  runtimeConfig: {
    brevoApiKey: process.env.BREVO_API_KEY ?? "",
    brevoListId: process.env.BREVO_LIST_ID ?? "",
    jwtSecret: process.env.JWT_SECRET ?? "change-me-in-production",
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? "https://trendzytours.com",
      whatsappNumber: process.env.WHATSAPP_NUMBER ?? "917123578454",
    },
  },

  nitro: {
    storage: {
      leads: {
        driver: "fs",
        base: "./.data/leads",
      },
    },
  },

  routeRules: {
    "/": { prerender: true },
    "/about": { prerender: true },
    "/contact": { prerender: true },
    "/holidays/**": { prerender: true },
    "/destinations/**": { isr: 3600 },
    "/tours/**": { isr: 3600 },
    "/blog/**": { isr: 1800 },
    "/dashboard/**": { ssr: false },
  },
})
