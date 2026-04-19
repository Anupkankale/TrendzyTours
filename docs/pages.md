# Pages & Routes

All pages live under `pages/` and follow Nuxt 3 file-based routing.

## Public Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `pages/index.vue` | Home page with hero, featured tours, offers, testimonials |
| `/about` | `pages/about.vue` | Agency story and team |
| `/contact` | `pages/contact.vue` | Contact form |
| `/login` | `pages/login.vue` | User login page |
| `/tours` | `pages/tours/index.vue` | Tour listing grid |
| `/tours/[slug]` | `pages/tours/[slug].vue` | Individual tour detail page |
| `/destinations` | `pages/destinations/` | Destination listing/detail |
| `/holidays` | `pages/holidays/` | Holiday packages |
| `/blog` | `pages/blog/` | Blog powered by Nuxt Content |

## Protected Pages

| Route | File | Guard | Description |
|-------|------|-------|-------------|
| `/dashboard` | `pages/dashboard/index.vue` | `auth` + `role` | Admin/user dashboard |

## Dynamic Segments

- `[slug]` — used in tours for individual tour detail pages

## Middleware Applied

- Dashboard routes use `auth.ts` to redirect unauthenticated users to `/login`
- `role.ts` restricts dashboard access based on user role
