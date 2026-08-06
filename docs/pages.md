# Pages & Routes

All pages live under `pages/` and follow Nuxt 3 file-based routing.

## Public Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `pages/index.vue` | Home — hero, featured tours, destinations, testimonials, offers |
| `/about` | `pages/about.vue` | Agency story and values |
| `/contact` | `pages/contact.vue` | Contact form with OTP email verification |
| `/login` | `pages/login.vue` | Login (`layout: false`, `noindex`) |
| `/terms` | `pages/terms.vue` | Terms of service |
| `/privacy-policy` | `pages/privacy-policy.vue` | Privacy policy |

### Holidays

| Route | File | Category filter |
|-------|------|-----------------|
| `/holidays` | `pages/holidays/index.vue` | All packages + category links |
| `/holidays/domestic` | `pages/holidays/domestic.vue` | `domestic` |
| `/holidays/world-travellers` | `pages/holidays/world-travellers.vue` | `world-travellers` |
| `/holidays/cruise-tours` | `pages/holidays/cruise-tours.vue` | `cruise` |
| `/holidays/ladies-only` | `pages/holidays/ladies-only.vue` | `ladies-only` |

### Tours, Destinations, Blog

| Route | File | Description |
|-------|------|-------------|
| `/tours/[slug]` | `pages/tours/[slug].vue` | Tour detail — itinerary, inclusions, pricing |
| `/destinations` | `pages/destinations/index.vue` | Region grid |
| `/destinations/[region]` | `pages/destinations/[region]/index.vue` | Tours filtered by region |
| `/blog` | `pages/blog/index.vue` | Post listing (Nuxt Content) |
| `/blog/[slug]` | `pages/blog/[slug].vue` | Post detail (Nuxt Content) |

> There is **no** `/tours` index route. Tour browsing lives under `/holidays`
> and `/destinations`; `pages/tours/` contains only the `[slug]` detail page.

## Protected Pages

All under `middleware: ["auth", "role"]`, `layout: "dashboard"`, and
`ssr: false` via `routeRules`.

| Route | File | Description |
|-------|------|-------------|
| `/dashboard` | `pages/dashboard/index.vue` | Overview |
| `/dashboard/tours` | `pages/dashboard/tours/index.vue` | Tour management list |
| `/dashboard/tours/create` | `pages/dashboard/tours/create.vue` | Create a tour |
| `/dashboard/tours/[id]/edit` | `pages/dashboard/tours/[id]/edit.vue` | Edit a tour |
| `/dashboard/bookings` | `pages/dashboard/bookings/index.vue` | Booking list |
| `/dashboard/bookings/[id]` | `pages/dashboard/bookings/[id].vue` | Booking detail |
| `/dashboard/leads` | `pages/dashboard/leads/index.vue` | Lead list |
| `/dashboard/leads/[id]` | `pages/dashboard/leads/[id].vue` | Lead detail |

## Dynamic Segments

| Segment | Used by | Resolves from |
|---------|---------|---------------|
| `[slug]` | `tours/`, `blog/` | Tour slug (API) / Nuxt Content path |
| `[region]` | `destinations/` | `data/destinations.ts` |
| `[id]` | `dashboard/tours`, `bookings`, `leads` | Record UUID |

## Middleware

- `auth.ts` — redirects unauthenticated users to `/login`
- `role.ts` — restricts dashboard access by role (`admin`, `sales`, `customer`, `seo`)

## Route Rules

Defined in `nuxt.config.ts`:

| Pattern | Rule |
|---------|------|
| `/`, `/about`, `/contact`, `/holidays/**` | `prerender` |
| `/destinations/**`, `/tours/**` | `isr: 3600` |
| `/blog/**` | `isr: 1800` |
| `/dashboard/**` | `ssr: false` + `X-Robots-Tag: noindex, nofollow` |
| `/login` | `X-Robots-Tag: noindex, nofollow` |

## SEO

Every public page calls `useSeo()`; most also emit structured data via
`useJsonLd()`. See [seo.md](seo.md) for the per-page schema table.
