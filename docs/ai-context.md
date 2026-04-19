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
| Auth | jose (JWT) — server-side only |
| Email | Brevo (Sendinblue) |
| SEO | @nuxtjs/sitemap ONLY — @nuxtjs/seo was removed (breaks Nuxt 3.21) |

---

## Project Structure

```
pages/
  index.vue              # Home
  about.vue
  contact.vue
  login.vue
  tours/index.vue        # Tour listing
  tours/[slug].vue       # Tour detail
  destinations/
  holidays/
  blog/
  dashboard/index.vue    # Protected, auth+role middleware

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
  useContactForm.ts      # Contact page form (vee-validate + zod)
  useNewsletterForm.ts   # Newsletter signup
  useTours.ts            # Tour data wrapper over tours store

middleware/
  auth.ts                # Redirect to /login if not authenticated
  role.ts                # Block by role (admin/sales/customer/seo)

server/api/
  tours.get.ts
  tours/[slug].get.ts
  contact.post.ts
  newsletter.post.ts
  auth/login.post.ts
  auth/logout.post.ts
  auth/me.get.ts

data/                    # Static seed data (no CMS in Iteration 1)
content/blog/            # Nuxt Content markdown blog posts
```

---

## Key Architectural Decisions

1. **No CMS** — tour/blog data is in `/data/` as seed JSON. Iteration 1 only.
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
