# Components

## Global (`components/global/`)

| Component | Description |
|-----------|-------------|
| `TheHeader.vue` | Site-wide navigation header |
| `TheFooter.vue` | Site-wide footer with links and info |
| `TheMobileMenu.vue` | Slide-out mobile navigation menu |

## Home (`components/home/`)

| Component | Description |
|-----------|-------------|
| `HeroSection.vue` | Full-width hero banner on the home page |
| `FeaturedTours.vue` | Grid of highlighted/featured tours |
| `DestinationGrid.vue` | Visual grid of top destinations |
| `SpecialOffers.vue` | Promotional offers / deals section |
| `TestimonialSlider.vue` | Swiper-powered customer testimonials carousel |
| `WhyChooseUs.vue` | Agency value propositions section |

## Tours (`components/tours/`)

| Component | Description |
|-----------|-------------|
| `TourCard.vue` | Card for a single tour — image, title, price, duration badge, wishlist toggle |
| `TourGrid.vue` | Responsive grid that renders multiple `TourCard` components |

`TourCard` uses a single stretched link (the whole card is clickable, one tab
stop) and falls back to a branded placeholder if the hero image fails to load.
It shows real `groupSize` data, not a rating — the `Tour` type has no rating
field.

## Dashboard (`components/dashboard/`)

| Component | Description |
|-----------|-------------|
| `DashHeader.vue` | Top bar for the dashboard layout |
| `DashSidebar.vue` | Role-aware side navigation |
| `TourForm.vue` | Shared create/edit tour form |

`TourForm` props: `initialValue?: TourFormInput`, `submitting?: boolean`,
`submitLabel?: string` (defaults to `"Save Tour"`).

## UI Primitives (`components/ui/`)

| Component | Props | Description |
|-----------|-------|-------------|
| `AppButton.vue` | `variant` (`primary`/`secondary`/`outline`/`ghost`), `size` (`sm`/`md`/`lg`), `href`, `disabled`, `loading`, `iconRight` | Button; renders as a link when `href` is set |
| `AppBadge.vue` | `label`, `variant` (`brand`/`dark`/`green`) | Small label/tag badge |
| `AppSectionTitle.vue` | `title`, `subtitle`, `eyebrow`, `center`, `light` | Consistent section heading block |
