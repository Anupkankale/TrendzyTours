# AI Context — Trendzy Tours

> Paste this entire file into ChatGPT, Gemini, or any AI that doesn't auto-load project files.
> Keep it updated as the project evolves.

---

## What is this project?

**Trendzy Tours** — a travel agency website built with Nuxt 3.
Domain: trendzytours.com | Location: Nagpur, India.

- **Iteration 1** (complete): public-facing website — home, tours, destinations, holidays, blog, about, contact
- **Iteration 2** (in progress): role-based admin dashboard with JWT auth

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 3.21.2 + TypeScript + Vite |
| Styling | Tailwind CSS 3 (gold/dark/cream palette) |
| Fonts | Playfair Display (headings), Inter (body) via @nuxtjs/google-fonts |
| State | Pinia — stores: auth, tours, ui |
| Content | @nuxt/content v2 — blog markdown in content/blog/ |
| Images | @nuxt/image — always use NuxtImg, never raw img tag |
| Icons | @nuxt/icon + @heroicons/vue |
| UI | @headlessui/vue |
| Forms | vee-validate + zod |
| Backend | Laravel 12 in `backend/` + MySQL 8.4 — NOT Nuxt server routes |
| Auth | JWT issued by Laravel, stored in a cookie |
| Email | Brevo (Sendinblue) |
| SEO | @nuxtjs/sitemap ONLY — @nuxtjs/seo was removed (breaks Nuxt 3.21) |

---

## Project Structure

```
pages/
  index.vue              # Home
  about.vue
  contact.vue            # Contact form
  login.vue
  terms.vue
  privacy-policy.vue
  tours/[slug].vue       # Tour detail (NO /tours index route exists)
  destinations/          # index.vue + [region]/index.vue
  holidays/              # index + domestic, world-travellers,
                         # cruise-tours, ladies-only
  blog/                  # index.vue + [slug].vue
  dashboard/             # Protected: index, tours/, bookings/, leads/

components/
  global/                # TheHeader, TheFooter, TheMobileMenu
  home/                  # HeroSection, FeaturedTours, DestinationGrid,
                         # SpecialOffers, TestimonialSlider, WhyChooseUs
  tours/                 # TourCard, TourGrid
  dashboard/             # DashHeader, DashSidebar
  ui/                    # AppButton, AppBadge, AppSectionTitle

stores/
  auth.ts                # User session, login/logout
  tours.ts               # Tour data + filters
  ui.ts                  # mobileMenuOpen toggle

composables/
  useApi.ts              # $fetch wrapper — baseURL, cookies, Accept: json
  useContactForm.ts      # Contact form (vee-validate + zod)
  useNewsletterForm.ts   # Newsletter signup (zod only)
  useTours.ts            # useTours(filters) / useTour(slug) via useAsyncData
  useSeo.ts              # Title, description, canonical, OG, Twitter
  useJsonLd.ts           # JSON-LD injection + schema builders

middleware/
  auth.ts                # Redirect to /login if not authenticated
  role.ts                # Block by role (admin/sales/customer/seo)

server/routes/_seo/
  sitemap-urls.ts        # Dynamic sitemap source (tours, regions, posts)

data/                    # Static seed data + site.ts (SEO/business facts)
content/blog/            # Nuxt Content markdown blog posts
public/robots.txt

backend/                 # Laravel 12 API — the real backend (see below)
```

---

## Backend

**There are no Nuxt `server/api/` endpoints.** The API is a separate Laravel 12
app in `backend/`, served on `:8888`, backed by MySQL 8.4 on `:3307` (docker
compose). The only Nitro server route is the sitemap source above.

| Endpoint | Purpose |
|----------|---------|
| `GET /api/tours` | List; supports `?category=`, `?region=`, `?featured=` |
| `GET /api/tours/{slug}` | Tour detail |
| `POST /api/contact` | Contact form (public, rate limited) |
| `POST /api/newsletter` | Brevo signup |
| `POST /api/auth/login`, `/logout` · `GET /api/auth/me` | JWT session |
| `GET/POST/PUT/DELETE /api/admin/tours` | Dashboard tour CRUD |
| `/api/bookings`, `/api/leads` | Dashboard data |

In dev, `NUXT_PUBLIC_API_BASE` is empty and `nitro.devProxy` forwards `/api/**`
to `:8888`. Use `||` not `??` when reading it — the empty string is intentional
and `??` won't fall back.

**SSR caveat:** because `baseURL` is empty, server-side `$fetch("/api/...")`
resolves against Nitro's internal router, not Laravel, and returns nothing.
Pages needing data during SSR fall back to `data/tours.ts` (see
`pages/tours/[slug].vue`). Listing pages don't, so they render empty
server-side.

---

## Key Architectural Decisions

1. **Tour data lives in MySQL** via the Laravel API. `data/tours.ts` is the SSR
   fallback and sitemap fallback, not the primary source. Blog stays in
   `content/blog/` markdown.
2. **Dashboard isolation** — uses `layout: "dashboard"`, protected by `middleware: ["auth", "role"]`, `ssr: false` via routeRules.
3. **routeRules** — `prerender` for static pages, `isr` for tours/blog, `ssr: false` for `/dashboard/**`.
4. **@nuxtjs/seo removed** — causes nuxt-og-image unenv path bug on Nuxt 3.21. Do not add it back.
5. **Roles** — admin, sales, customer, seo. Sidebar is role-aware.

---

## Coding Conventions

- All Vue SFCs use `<script setup lang="ts">`
- Always use `<NuxtImg>` / `<NuxtPicture>` — never raw `<img>`
- Reuse `AppButton`, `AppBadge`, `AppSectionTitle` from `components/ui/`
- Forms always use vee-validate + zod schema validation
- Dashboard pages need: `definePageMeta({ middleware: ['auth', 'role'] })`
- Mobile-first Tailwind (sm: md: lg: xl:)

---

## How to Reference Code Without Pasting It

Instead of pasting full file contents, tell the AI:

- "In `components/home/HeroSection.vue`, I want to add a search bar"
- "The tours store is `stores/tours.ts` — add a filter by duration"
- "Follow the same pattern as `middleware/auth.ts` for a new guard"
- "Use the same form setup as `composables/useContactForm.ts`"

The AI can then reason about the file using its knowledge of Nuxt patterns,
and you paste only the specific part you need help with.

---

## Dev Commands

```bash
npm run dev       # http://localhost:3000
npm run build
npm run typecheck
npm run lint
```
