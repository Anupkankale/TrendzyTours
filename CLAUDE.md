# Trendzy Tours — Claude Context

> Auto-loaded by Claude Code. Do not delete. Update as the project evolves.

## Project

**Trendzy Tours** — travel agency website. Domain: trendzytours.com. Location: Nagpur, India.
- Iteration 1: public-facing website (complete)
- Iteration 2: role-based dashboard (scaffolded, in progress)

## Stack

- **Framework:** Nuxt 3.21.2 + TypeScript + Vite
- **Styling:** Tailwind CSS 3 — custom gold/dark/cream palette; Playfair Display (headings), Inter (body) via @nuxtjs/google-fonts
- **State:** Pinia (`stores/auth.ts`, `stores/tours.ts`, `stores/ui.ts`)
- **Content/Blog:** @nuxt/content — markdown files in `content/blog/`
- **Images:** @nuxt/image (webp/avif, quality 80)
- **Icons:** @nuxt/icon + @heroicons/vue
- **UI Primitives:** @headlessui/vue
- **Forms:** vee-validate + zod
- **Auth:** jose (JWT) — server/api/auth/{login,logout,me}
- **Email:** Brevo (Sendinblue) — newsletter + contact
- **SEO:** @nuxtjs/sitemap (standalone)

## Architecture

```
pages/           → file-based routing (index, about, contact, login, tours/[slug], dashboard/)
components/
  global/        → TheHeader, TheFooter, TheMobileMenu
  home/          → HeroSection, FeaturedTours, DestinationGrid, SpecialOffers, TestimonialSlider, WhyChooseUs
  tours/         → TourCard, TourGrid
  dashboard/     → DashHeader, DashSidebar
  ui/            → AppButton, AppBadge, AppSectionTitle
stores/          → auth.ts, tours.ts, ui.ts
composables/     → useContactForm.ts, useNewsletterForm.ts, useTours.ts
middleware/      → auth.ts (redirect unauthenticated), role.ts (RBAC)
content/blog/    → Nuxt Content markdown (blog posts)
data/            → static seed data (no CMS, Iteration 1)
server/api/      → tours, tours/[slug], contact, newsletter, auth/
docs/            → full markdown documentation
```

## Key Decisions

- `@nuxtjs/seo` was **removed** — incompatible with Nuxt 3.21 (nuxt-og-image unenv path bug). Using `@nuxtjs/sitemap` standalone instead.
- Tour/blog data lives in `/data/` as seed data — no CMS in Iteration 1.
- Dashboard is fully isolated: `layout: "dashboard"`, `/dashboard/**` prefix, `middleware: ["auth", "role"]`.
- `routeRules`: prerender static pages, `isr` for tours/blog, `ssr: false` for `/dashboard/**`.
- Sitemap excludes `/dashboard/**` and `/login`.
- Roles: `admin`, `sales`, `customer`, `seo`.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/tours` | All tours (8 total) |
| `/api/tours/[slug]` | Single tour detail |
| `/api/contact` | Contact form submission (Brevo) |
| `/api/newsletter` | Newsletter signup (Brevo) |
| `/api/auth/login` | Login → JWT cookie |
| `/api/auth/logout` | Clear session |
| `/api/auth/me` | Current user info |

## Dev Commands

```bash
npm run dev          # http://localhost:3000 (or 3001 if port busy)
npm run build        # Production build
npm run generate     # Static site generation
npm run typecheck    # vue-tsc --noEmit
npm run lint         # ESLint
```

## Docs Reference

See `docs/` for deep-dive documentation:
- `docs/overview.md` — project goals and tech stack
- `docs/architecture.md` — folder structure
- `docs/pages.md` — all routes
- `docs/components.md` — component catalogue
- `docs/stores.md` — Pinia stores
- `docs/composables.md` — composables
- `docs/middleware.md` — route guards
- `docs/styling.md` — Tailwind conventions
- `docs/setup.md` — local dev setup
- `docs/ai-context.md` — condensed context for other AI tools
