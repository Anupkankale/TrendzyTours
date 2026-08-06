# Project Overview

## About

**Trendzy Tours** is a travel agency web application built with Nuxt 3, backed by
a separate Laravel 12 API. It allows users to browse tours and destinations, read
travel blog content, contact the agency, and manage bookings, leads and tours via
a protected role-based dashboard.

The repository holds both halves: the Nuxt frontend at the root, and the Laravel
API in `backend/`. See [backend-local.md](backend-local.md) to run the API.

## Goals

- Showcase travel packages, destinations, and holiday deals
- Provide a smooth user experience with SSR/SSG
- Offer a dashboard for authenticated users/admins
- Maintain a blog powered by Nuxt Content

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 3 |
| Backend API | Laravel 12 + MySQL 8.4 (`backend/`) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| State Management | Pinia |
| Forms | VeeValidate + Zod |
| Content/Blog | @nuxt/content v2 |
| Icons | @nuxt/icon + @heroicons/vue |
| Images | @nuxt/image |
| Fonts | @nuxtjs/google-fonts |
| SEO | @nuxtjs/sitemap + `useSeo` / `useJsonLd` (see [seo.md](seo.md)) |
| UI Primitives | @headlessui/vue |
| Slider | Swiper |
| Auth | JWT issued by Laravel, held in an HTTP-only cookie |
| Linting | ESLint (@antfu/eslint-config) |
| Formatting | Prettier + prettier-plugin-tailwindcss |
| Git Hooks | Husky + lint-staged |

> `jose` and `firebase` appear in `package.json` but are not imported anywhere
> in the frontend. Leftovers from an earlier auth approach — safe to remove.

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run generate     # Static site generation
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type check
```
