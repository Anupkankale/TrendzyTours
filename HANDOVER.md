# Trendzy Tours — Project Handover

**Date:** 2026-04-30  
**Project Root:** `/home/anupkankale/projects/tour-nuxt`

## Current State

The project is a Nuxt 3 frontend with a Laravel backend in `backend/`, running locally through Laravel Sail on `http://localhost:8888`.

Phase 1 is still in progress in [PLAN.md](/home/anupkankale/projects/tour-nuxt/PLAN.md:1):
- Feature 1 — Bookings dashboard: complete
- Feature 2 — Tours CRUD dashboard: complete
- Feature 3 — Blog CMS: next
- Feature 4 — Users management: pending

## What Was Completed Recently

### 1. Tours CRUD Dashboard

Admin-only tours management was added:
- `/dashboard/tours`
- `/dashboard/tours/create`
- `/dashboard/tours/[id]/edit`

Key files:
- [pages/dashboard/tours/index.vue](/home/anupkankale/projects/tour-nuxt/pages/dashboard/tours/index.vue:1)
- [pages/dashboard/tours/create.vue](/home/anupkankale/projects/tour-nuxt/pages/dashboard/tours/create.vue:1)
- [pages/dashboard/tours/[id]/edit.vue](/home/anupkankale/projects/tour-nuxt/pages/dashboard/tours/[id]/edit.vue:1)
- [components/dashboard/TourForm.vue](/home/anupkankale/projects/tour-nuxt/components/dashboard/TourForm.vue:1)
- [stores/tours.ts](/home/anupkankale/projects/tour-nuxt/stores/tours.ts:1)
- [backend/app/Http/Controllers/TourController.php](/home/anupkankale/projects/tour-nuxt/backend/app/Http/Controllers/TourController.php:1)
- [backend/routes/api.php](/home/anupkankale/projects/tour-nuxt/backend/routes/api.php:1)

Backend admin tour endpoints:
- `GET /api/admin/tours`
- `POST /api/admin/tours`
- `GET /api/admin/tours/{id}`
- `PUT /api/admin/tours/{id}`
- `DELETE /api/admin/tours/{id}`

### 2. Live / Not Live Tour Visibility

The intended workflow is now toggle-based, not delete-based.

Behavior:
- tours marked live are shown on public pages
- tours marked not live are hidden from public pages
- the dashboard list labels this state as `Live` / `Not Live`

Public tour API behavior:
- [TourController.php](/home/anupkankale/projects/tour-nuxt/backend/app/Http/Controllers/TourController.php:1) now only returns tours with `published_at` set for:
  - `GET /api/tours`
  - `GET /api/tours/{slug}`

### 3. Public Pages Moved To Backend Tour API

Several pages previously read from `data/tours.ts`. They now use the backend API:
- [components/home/FeaturedTours.vue](/home/anupkankale/projects/tour-nuxt/components/home/FeaturedTours.vue:1)
- [pages/holidays/index.vue](/home/anupkankale/projects/tour-nuxt/pages/holidays/index.vue:1)
- [pages/holidays/domestic.vue](/home/anupkankale/projects/tour-nuxt/pages/holidays/domestic.vue:1)
- [pages/holidays/world-travellers.vue](/home/anupkankale/projects/tour-nuxt/pages/holidays/world-travellers.vue:1)
- [pages/holidays/cruise-tours.vue](/home/anupkankale/projects/tour-nuxt/pages/holidays/cruise-tours.vue:1)
- [pages/holidays/ladies-only.vue](/home/anupkankale/projects/tour-nuxt/pages/holidays/ladies-only.vue:1)
- [pages/destinations/[region]/index.vue](/home/anupkankale/projects/tour-nuxt/pages/destinations/[region]/index.vue:1)
- [pages/tours/[slug].vue](/home/anupkankale/projects/tour-nuxt/pages/tours/[slug].vue:1)

Shared query helper:
- [composables/useTours.ts](/home/anupkankale/projects/tour-nuxt/composables/useTours.ts:1)

SSR-safe API helper:
- [composables/useApi.ts](/home/anupkankale/projects/tour-nuxt/composables/useApi.ts:1)

### 4. Safer Tour Deletion

Even though the dashboard no longer centers deletion, the backend still guards against data loss.

Important rule:
- tours with existing bookings cannot be deleted

Reason:
- `bookings.tour_id` cascades on delete in the DB schema
- deleting a booked tour would otherwise wipe bookings

Guard location:
- [backend/app/Http/Controllers/TourController.php](/home/anupkankale/projects/tour-nuxt/backend/app/Http/Controllers/TourController.php:1)

### 5. Local Docs Added

A short local backend quickstart was added:
- [docs/backend-local.md](/home/anupkankale/projects/tour-nuxt/docs/backend-local.md:1)
- linked from [docs/README.md](/home/anupkankale/projects/tour-nuxt/docs/README.md:1)

## Important Local Fixes Applied

### Backend Session Fix

The backend had a local runtime issue because `SESSION_DRIVER=database` was set but there is no `sessions` table migration in this repo.

Local fix:
- [backend/.env](/home/anupkankale/projects/tour-nuxt/backend/.env:1) should use:
  - `SESSION_DRIVER=file`

If the backend starts failing again with a `sessions` table error, run:

```bash
cd backend
./vendor/bin/sail artisan optimize:clear
./vendor/bin/sail restart
```

### Nuxt Image / IPX Fix

The frontend was throwing 500s for remote Unsplash images via `/_ipx/...`.

Local fix:
- [nuxt.config.ts](/home/anupkankale/projects/tour-nuxt/nuxt.config.ts:1) now sets:
  - `image.provider = "none"`

This avoids local IPX proxy failures in development.

## Current Environment Expectations

Frontend root `.env`:

```env
NUXT_PUBLIC_API_BASE=http://localhost:8888
```

Backend key local expectations:

```env
APP_PORT=8888
DB_DATABASE=laravel
SESSION_DRIVER=file
```

## Local Run Commands

Frontend:

```bash
cd /home/anupkankale/projects/tour-nuxt
npm run dev
```

Backend:

```bash
cd /home/anupkankale/projects/tour-nuxt/backend
./vendor/bin/sail up -d
```

Useful backend checks:

```bash
curl http://localhost:8888
curl http://localhost:8888/api/tours
curl "http://localhost:8888/api/tours?featured=true"
```

## Known Caveats

- `/` is still prerendered in [nuxt.config.ts](/home/anupkankale/projects/tour-nuxt/nuxt.config.ts:1), so after data-path changes you may need to restart the Nuxt server to avoid stale homepage output.
- Public tour visibility now depends on backend data. If homepage/holiday pages are empty, check whether tours are both:
  - live
  - featured, for homepage featured section
- The wording in `PLAN.md` for Feature 2 still mentions delete with confirm modal, but the current product direction is moving toward live/not-live management instead.

## Recommended Next Step

Continue with Phase 1, Feature 3:
- Blog CMS dashboard
- routes:
  - `/dashboard/blog`
  - `/dashboard/blog/create`
  - `/dashboard/blog/[id]/edit`
