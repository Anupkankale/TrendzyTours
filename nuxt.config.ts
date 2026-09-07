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
    provider: "none",
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

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || "https://trendzytours.com",
    name: "Trendzy Tours",
  },

  sitemap: {
    sitemaps: true,
    exclude: ["/dashboard/**", "/login"],
    // Tours, destination regions and blog posts are enumerated at request time.
    sources: ["/_seo/sitemap-urls"],
    defaults: { changefreq: "weekly", priority: 0.7 },
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
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "https://trendzytours.com",
      whatsappNumber: process.env.WHATSAPP_NUMBER ?? "917123578454",
    },
  },

  nitro: {
    devProxy: {
      "/api": {
        target: (process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8888") + "/api",
        changeOrigin: true,
      },
    },
  },

  routeRules: {
    // isr is native to the Vercel preset we deploy under. Keep it rather than
    // swr: swr only reaches Vercel through a deprecated back-compat path.
    // `/` and `/holidays/**` are revalidated rather than prerendered so a tour
    // published from the dashboard appears without waiting for a redeploy.
    "/": { isr: 900 },
    "/about": { prerender: true },
    "/contact": { prerender: true },
    "/holidays/**": { isr: 900 },
    "/destinations/**": { isr: 3600 },
    "/tours/**": { isr: 3600 },
    "/blog/**": { isr: 1800 },
    // Private routes: header-level noindex works even though these are SPA-rendered.
    "/dashboard/**": { ssr: false, headers: { "X-Robots-Tag": "noindex, nofollow" } },
    "/login": { headers: { "X-Robots-Tag": "noindex, nofollow" } },
  },
})
