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
│   ├── blog/
│   ├── dashboard/
│   ├── destinations/
│   ├── holidays/
│   └── tours/
├── server/                  # Nitro server routes / API
├── stores/                  # Pinia stores
├── types/                   # Shared TypeScript types
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
