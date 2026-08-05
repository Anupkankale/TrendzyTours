# Changelog

Notable changes, newest first. Covers what changed and *why*, so the reasoning
survives past the diff.

---

## `fix/tour-card-and-technical-seo`

Three related pieces of work: a broken image, a card quality pass, and the
technical SEO foundation.

### 1. Dead hero image on Rajasthan Royal

`fix(tours): replace dead Unsplash hero image for Rajasthan Royal`

The Unsplash photo ID `photo-1477587458883-47145ed94373` no longer exists and
returns **404 `text/html`**, so `NuxtImg` rendered the browser's broken-image
glyph inside the card.

Replaced with a Hawa Mahal, Jaipur photo (`photo-1695395550316-8995ae9d35ff`),
chosen to match the tour's own copy — highlight #1 is "Jaipur Pink City" and day
1 is "Pink City welcome, Hawa Mahal visit."

The URL was duplicated in three files, all updated:

| File | Field |
|------|-------|
| `backend/database/seeders/TourSeeder.php` | `hero_image`, `gallery` |
| `data/tours.ts` | `heroImage`, `gallery` |
| `components/home/SpecialOffers.vue` | `image` |

The seeder only affects fresh installs, so the two live MySQL rows were patched
with targeted `UPDATE`s (`tours.hero_image`, `tour_gallery.image_url`) rather
than a re-seed, which would have wiped bookings and leads.

**Second defect found in the same record:** the Rajasthan gallery pointed at the
*Bali* photo, so the detail page showed an Indonesian beach for a Rajasthan
trip. It loaded fine, so nothing looked broken. Every other tour's gallery
matches its own hero — a copy-paste slip. Also fixed.

A sweep of all 14 Unsplash URLs in the repo found no other dead links.

### 2. TourCard quality pass

`refactor(ui): harden TourCard accessibility and image resilience`

| Change | Reason |
|--------|--------|
| Fallback placeholder on image `@error` | A dead URL now degrades the card instead of breaking it — the failure mode above |
| Single stretched link replaces duplicate image + "Book Now" links | Both pointed at the same URL: two tab stops, same announcement twice |
| Removed the hard-coded `(4.8)` rating | The `Tour` type has no rating field; the stars and score were fabricated. Replaced with real `groupSize` data |
| `<article>` + `aria-labelledby` | Gives each card a proper accessible name |
| `aria-pressed`, `type="button"` on wishlist | Communicates toggle state; prevents form submission |
| 44×44px wishlist target | Was ~32px, below the touch-target guideline |
| `group-focus-within` on the hover overlay | Keyboard users never saw the hover-only affordance |
| `aspect-[3/2]` wrapper, `decoding="async"` | Reserves layout space; avoids blocking decode |

Global `prefers-reduced-motion` and `:focus-visible` rules already exist in
`assets/css/tailwind.css`, so no per-component handling was needed.

### 3. Technical SEO

`feat(seo): canonicals, structured data, dynamic sitemap and robots.txt`

Full details in [seo.md](seo.md). Summary of the gaps closed:

| Before | After |
|--------|-------|
| Sitemap listed 12 static routes; no tours, blog or destinations | 28 URLs, dynamically sourced from the live API |
| No canonical tags anywhere | Canonical on all 16 public pages |
| No structured data | `TravelAgency`, `WebSite`, `TouristTrip` + `Offer`, `BreadcrumbList`, `BlogPosting`, `ItemList` |
| OG tags on 2 pages, no Twitter Card | Full OG + Twitter Card on all public pages |
| No `robots.txt` | Added, with sitemap pointer |
| `/login`, `/dashboard` indexable | `X-Robots-Tag: noindex, nofollow` |

New files: `data/site.ts`, `composables/useSeo.ts`, `composables/useJsonLd.ts`,
`server/routes/_seo/sitemap-urls.ts`, `public/robots.txt`.

### Bug fixed along the way

`nuxt.config.ts` built the API devProxy target with `??`:

```ts
target: (process.env.NUXT_PUBLIC_API_BASE ?? "http://localhost:8888") + "/api"
```

`.env` sets `NUXT_PUBLIC_API_BASE=` (empty string) on purpose, and `??` only
falls back on `null`/`undefined` — so the target resolved to the relative string
`/api`. Every API request looped back into the Nuxt router
(`No match found for location with path "/api/tours"`) and hung until timeout.
Changed to `||`; same fix applied to `siteUrl`.

### Known limitation, not addressed

`useApi()` sets `baseURL` to an empty string, so SSR `$fetch("/api/tours")`
never reaches Laravel. `/holidays/**` and `/destinations/**` render zero tours
server-side. The home page and tour detail pages are unaffected — both fall back
to `data/tours.ts`. This predates the branch and is deliberately out of scope;
see [seo.md](seo.md) *Known gaps* for the SEO consequences.
