# Architecture

## Folder Structure

```
tour-nuxt/
├── app.vue                  # Root app component
├── assets/                  # Static assets (CSS, images)
├── components/
│   ├── dashboard/           # Dashboard-specific components
│   ├── global/              # App-wide layout components (Header, Footer)
│   ├── home/                # Home page section components
│   ├── tours/               # Tour listing components
│   └── ui/                  # Reusable UI primitives
├── composables/             # Vue composables
├── content/                 # Nuxt Content markdown files (blog)
├── data/                    # Static data / mock data
├── docs/                    # Project documentation (this folder)
├── layouts/                 # Nuxt layouts
├── middleware/              # Route middleware
├── pages/                   # File-based routing
│   ├── index.vue            # Home
│   ├── about.vue
│   ├── contact.vue
│   ├── login.vue
│   ├── terms.vue
│   ├── privacy-policy.vue
│   ├── blog/                # index + [slug]
│   ├── dashboard/           # index + tours/, bookings/, leads/
│   ├── destinations/        # index + [region]/
│   ├── holidays/            # index + 4 category pages
│   └── tours/               # [slug] only — no index route
├── public/                  # Served as-is (robots.txt, images)
├── server/routes/_seo/      # Sitemap URL source (NOT the app API)
├── stores/                  # Pinia stores
├── types/                   # Shared TypeScript types
├── backend/                 # Laravel 12 API + MySQL — the real backend
├── nuxt.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Key Architectural Decisions

- **File-based routing** — pages map directly to URL structure via `pages/`
- **Nuxt Content** — blog and static content authored in markdown under `content/`
- **Pinia** — centralised state split by domain: `auth`, `tours`, `ui`
- **Middleware guards** — `auth.ts` and `role.ts` protect dashboard routes
- **Component layers** — UI primitives in `ui/`, page-specific sections co-located with their domain folder
- **Separate backend** — the API is a Laravel 12 app in `backend/`, not Nuxt server routes.
  `nitro.devProxy` forwards `/api/**` to it in development. `server/` holds only the
  sitemap URL source.
- **SEO** — `useSeo()` and `useJsonLd()` on every public page; see [seo.md](seo.md)
