# Technical SEO

How search metadata, structured data, the sitemap, and crawler directives work
on the public site. Everything here is server-rendered — no client-side SEO.

## Moving parts

| Piece | File | Job |
|-------|------|-----|
| Site + business facts | `data/site.ts` | Single source of truth for name, URL, logo, NAP |
| Head tags | `composables/useSeo.ts` | Title, description, canonical, Open Graph, Twitter Card, robots |
| Structured data | `composables/useJsonLd.ts` | JSON-LD builders and injection |
| Sitemap source | `server/routes/_seo/sitemap-urls.ts` | Enumerates tours, regions, blog posts |
| Crawler rules | `public/robots.txt` | Allow/disallow + sitemap pointer |
| Route directives | `nuxt.config.ts` → `routeRules` | `X-Robots-Tag` on private routes |

## Configuration

The production origin drives canonicals, `og:url`, sitemap entries, and every
absolute URL in the structured data.

```ts
// nuxt.config.ts
site: {
  url: process.env.NUXT_PUBLIC_SITE_URL || "https://trendzytours.com",
  name: "Trendzy Tours",
}
```

Set `NUXT_PUBLIC_SITE_URL` per environment. In local dev `.env` sets it to
`http://localhost:3000`, so sitemap and canonical URLs will read `localhost`
during development — that is expected, not a bug.

> **Use `||`, not `??`.** `.env` sets some vars to an empty string
> deliberately. `??` only falls back on `null`/`undefined`, so an empty string
> survives and silently produces a broken value. This exact trap once made the
> API devProxy target resolve to the relative string `/api`.

## `useSeo()`

One call per page. Sets title, description, canonical, the full Open Graph set,
Twitter Card tags, and the robots directive.

```vue
<script setup lang="ts">
useSeo({
  title: "Domestic Holiday Packages",
  description: "Explore India with our handcrafted domestic tour packages...",
})
</script>
```

| Option | Type | Notes |
|--------|------|-------|
| `title` | `string` | ` \| Trendzy Tours` is appended automatically |
| `description` | `string` | Used for `description`, `og:description`, `twitter:description` |
| `titleRaw` | `boolean` | Skip the site-name suffix (used on the home page) |
| `image` | `string` | Path or absolute URL; resolved to absolute. Defaults to `site.ogImage` |
| `type` | `"website" \| "article"` | `article` adds published-time and author tags |
| `noindex` | `boolean` | Emits `noindex, nofollow` |
| `canonicalPath` | `string` | Override the canonical path (default: current route) |
| `publishedTime`, `author` | `string` | Article-only |

Canonicals are normalised: trailing slashes are stripped (except root) so the
same page can never split into two canonical URLs.

Helpers `useSiteUrl()` and `useAbsoluteUrl(path)` are exported for anything that
needs the origin directly.

## `useJsonLd()`

Takes any number of schema nodes and injects them as `application/ld+json`.
Nullish nodes are skipped, so a builder can opt out by returning `null`.

```vue
<script setup lang="ts">
useJsonLd(
  tourSchema(currentTour.value),
  breadcrumbSchema([
    { name: "Holiday Packages", path: "/holidays" },
    { name: currentTour.value.name, path: `/tours/${currentTour.value.slug}` },
  ]),
)
</script>
```

JSON is injected as `innerHTML`, so `<`, `>` and `&` are escaped to `\uXXXX`
before serialisation. That escape is the injection boundary — do not remove it.

### Builders

| Builder | Emits | Used on |
|---------|-------|---------|
| `travelAgencySchema()` | `TravelAgency` with NAP, geo, hours, `sameAs` | `/` only |
| `webSiteSchema()` | `WebSite` | `/` only |
| `tourSchema(tour)` | `TouristTrip` + priced `Offer` + itinerary | `/tours/[slug]` |
| `breadcrumbSchema(trail)` | `BreadcrumbList` (Home is prepended for you) | Most pages |
| `articleSchema(post)` | `BlogPosting` | `/blog/[slug]` |
| `tourListSchema(tours, name)` | `ItemList`, or `null` when empty | Listing pages |

`travelAgencySchema()` and `webSiteSchema()` are emitted **once**, on the home
page, under stable `@id`s (`{origin}/#organization`, `{origin}/#website`). Other
schemas reference the organisation by `@id` rather than repeating it.

`tourListSchema()` returns `null` for an empty list — an `ItemList` advertising
zero items is worse than no `ItemList`.

## Page coverage

| Route | Schema |
|-------|--------|
| `/` | `TravelAgency`, `WebSite` |
| `/tours/[slug]` | `TouristTrip` + `Offer`, `BreadcrumbList` |
| `/blog/[slug]` | `BlogPosting`, `BreadcrumbList` |
| `/holidays`, `/holidays/*` | `BreadcrumbList`, `ItemList` |
| `/destinations`, `/destinations/[region]` | `BreadcrumbList`, `ItemList` |
| `/about`, `/contact`, `/blog` | `BreadcrumbList` |
| `/terms`, `/privacy-policy` | none (meta only) |
| `/login` | none — `noindex` |

## Sitemap

`@nuxtjs/sitemap` handles static routes automatically. Dynamic routes come from
a server route registered as a source:

```ts
sitemap: {
  sitemaps: true,
  exclude: ["/dashboard/**", "/login"],
  sources: ["/_seo/sitemap-urls"],
  defaults: { changefreq: "weekly", priority: 0.7 },
}
```

`server/routes/_seo/sitemap-urls.ts` returns tours, destination regions, and
blog posts. Tours are fetched from the live Laravel API so anything published
through the dashboard gets indexed; the static seed in `data/tours.ts` is the
fallback, so a backend outage degrades the sitemap instead of emptying it.

> **The route is deliberately not under `/api`.** `nitro.devProxy` forwards
> every `/api/**` request to the Laravel backend, which would shadow it in
> development. Keep new SEO server routes under `/_seo/`.

Entry points: `/sitemap_index.xml` → `/__sitemap__/0.xml`. Currently 28 URLs
(12 static + 8 tours + 6 regions + 2 blog posts).

## Crawler directives

`public/robots.txt` allows everything except `/dashboard`, `/login`, `/_seo/`
and `/_nuxt/`, and points at `https://trendzytours.com/sitemap_index.xml`.

Private routes also send a header, because `/dashboard/**` is `ssr: false` — a
meta tag inside a client-rendered shell never reaches a crawler:

```ts
"/dashboard/**": { ssr: false, headers: { "X-Robots-Tag": "noindex, nofollow" } },
"/login":        { headers: { "X-Robots-Tag": "noindex, nofollow" } },
```

## Verifying

With `npm run dev` running:

```bash
# Sitemap contents
curl -s localhost:3000/__sitemap__/0.xml | grep -o '<loc>[^<]*</loc>'

# The dynamic source on its own
curl -s localhost:3000/_seo/sitemap-urls

# Head tags for one page
curl -s localhost:3000/tours/rajasthan-royal-10-nights \
  | grep -oE '<link rel="canonical"[^>]*>|<meta property="og:[^>]*>'

# noindex headers
curl -sI localhost:3000/login | grep -i x-robots-tag
```

To confirm the JSON-LD parses, extract the `application/ld+json` blocks and run
them through a JSON parser, then paste into Google's Rich Results Test.

## Known gaps

1. **Listing pages render zero tours server-side.** `useApi()` sets
   `baseURL` to an empty string, so during SSR `$fetch("/api/tours")` resolves
   against Nitro's internal router instead of Laravel and returns nothing.
   `/holidays/**` and `/destinations/**` therefore serve "No tours found" to
   crawlers, their `ItemList` is omitted, and no crawlable internal links point
   at the tour pages. The sitemap covers discovery, but internal linking is a
   ranking signal currently going unused. Home and `/tours/[slug]` are unaffected
   because they fall back to `data/tours.ts`.
2. **No dedicated Open Graph image.** `site.ogImage` points at the logo, so
   shares of static pages render a letterboxed logo instead of a proper card.
   Add a 1200×630 image and update `data/site.ts`. Tour and blog pages use their
   own hero images and are fine.
3. **Placeholder business data.** `business.latitude/longitude` are Nagpur city
   centre, not the storefront, and `sameAs` points at bare `facebook.com` /
   `instagram.com`. Both carried over from the footer. Real values strengthen the
   local-SEO signal.
4. **No `AggregateRating`.** Deliberate — the `Tour` type has no rating field, and
   inventing review data would be both a Google policy violation and misleading
   to customers. Add it only when real reviews exist.
