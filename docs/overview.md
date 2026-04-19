# Project Overview

## About

**Trendzy Tours** is a travel agency web application built with Nuxt 3. It allows users to browse tours and destinations, read travel blog content, contact the agency, and manage bookings via a protected dashboard.

## Goals

- Showcase travel packages, destinations, and holiday deals
- Provide a smooth user experience with SSR/SSG
- Offer a dashboard for authenticated users/admins
- Maintain a blog powered by Nuxt Content

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 3 |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| State Management | Pinia |
| Forms | VeeValidate + Zod |
| Content/Blog | @nuxt/content v2 |
| Icons | @nuxt/icon + @heroicons/vue |
| Images | @nuxt/image |
| Fonts | @nuxtjs/google-fonts |
| SEO | @nuxtjs/sitemap |
| UI Primitives | @headlessui/vue |
| Slider | Swiper |
| Auth | jose (JWT) |
| Linting | ESLint (@antfu/eslint-config) |
| Formatting | Prettier + prettier-plugin-tailwindcss |
| Git Hooks | Husky + lint-staged |

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run generate     # Static site generation
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type check
```
