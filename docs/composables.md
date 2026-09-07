# Composables

All composables live under `composables/` and are auto-imported by Nuxt.

## `useApi.ts`

Thin wrapper over `$fetch` that every other composable goes through. Applies the
API base URL, sends cookies, and asks for JSON.

- `baseURL` comes from `runtimeConfig.public.apiBase` (`NUXT_PUBLIC_API_BASE`)
- `credentials: "include"` so the JWT session cookie travels with the request
- `Accept: application/json` — without it Laravel returns an HTML redirect
  instead of a JSON validation error

**Usage:**
```vue
<script setup>
const { apiFetch } = useApi()
const tours = await apiFetch("/api/tours")
</script>
```

> **Dev setup.** `NUXT_PUBLIC_API_BASE` is intentionally empty locally, so
> `apiFetch` issues relative `/api/*` requests that `nitro.devProxy` forwards to
> the Laravel backend on `:8888`.
>
> **Known limitation.** Because `baseURL` is an empty string, a server-side
> `$fetch("/api/tours")` resolves against Nitro's internal router rather than
> Laravel, and returns nothing. Pages that need data during SSR must fall back
> to `data/tours.ts` — see `pages/tours/[slug].vue` for the pattern. Listing
> pages currently don't, so they render empty server-side. See
> [seo.md](seo.md) *Known gaps*.

## `useTours.ts`

Data fetching for tours. Exports two functions; neither touches the Pinia store.

### `useTours(options?)`

Fetches the tour list via `useAsyncData`, optionally filtered.

| Option | Type | Effect |
|--------|------|--------|
| `category` | `string` | `?category=` filter |
| `region` | `string` | `?region=` filter |
| `featured` | `boolean` | `?featured=` filter |
| `key` | `string` | Override the `useAsyncData` cache key |

Returns `{ tours, pending, error }`. The default key is derived from the
filters, so distinct filter combinations don't share a cache entry.

### `useTour(slug)`

Fetches a single tour. Returns `{ tour, pending, error }`.

**Usage:**
```vue
<script setup>
const { tours: domestic } = useTours({ category: "domestic", key: "domestic-live-tours" })
const { tour } = useTour("rajasthan-royal-10-nights")
</script>
```

## `useContactForm.ts`

Contact page form. Submits straight to `POST /api/contact`; the email OTP step
that used to gate this was removed, and the endpoint is rate limited server-side
instead.

- **VeeValidate** + **Zod** validation over `name`, `email`, `phone`,
  `tourInterest` (optional), `message`
- Fields are exposed as `defineField` pairs — e.g. `name` and `nameProps`

**Returns:**

| Group | Values |
|-------|--------|
| Fields | `name`/`nameProps`, `email`/`emailProps`, `phone`/`phoneProps`, `tourInterest`/`tourInterestProps`, `message`/`messageProps`, `errors` |
| Submission | `submit`, `isSubmitting`, `isSuccess`, `serverError` |

**Usage:**
```vue
<script setup>
const {
  name, nameProps, email, emailProps, errors,
  submit, isSubmitting, isSuccess, serverError,
} = useContactForm()
</script>
```

## `useNewsletterForm.ts`

Newsletter subscription, used in the footer.

- Validates the email with Zod on submit (no VeeValidate here)
- `POST /api/newsletter`
- Clears the input on success

Returns `{ email, subscribe, isSubmitting, isSuccess, error }`.

**Usage:**
```vue
<script setup>
const { email, subscribe, isSubmitting, isSuccess, error } = useNewsletterForm()
</script>
```

## `useSeo.ts`

Sets every head tag a public page needs in one call: title, description,
canonical, Open Graph, Twitter Card, and the robots directive. Also exports
`useSiteUrl()` and `useAbsoluteUrl()`.

**Usage:**
```vue
<script setup>
useSeo({
  title: "Domestic Holiday Packages",
  description: "Explore India with our handcrafted domestic tour packages.",
})
</script>
```

See [seo.md](seo.md) for all options.

## `useJsonLd.ts`

Injects JSON-LD structured data, plus the schema builders
(`travelAgencySchema`, `webSiteSchema`, `tourSchema`, `breadcrumbSchema`,
`articleSchema`, `tourListSchema`).

**Usage:**
```vue
<script setup>
useJsonLd(
  tourSchema(tour),
  breadcrumbSchema([{ name: tour.name, path: `/tours/${tour.slug}` }]),
)
</script>
```

See [seo.md](seo.md) for the builder reference.
