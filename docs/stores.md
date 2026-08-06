# Pinia Stores

All stores live under `stores/` and are auto-imported by Pinia + Nuxt. Every
store is written in the setup-function style and goes through `useApi()` for
network calls.

## `stores/auth.ts`

Authentication state. The JWT is issued by the Laravel backend and stored in an
HTTP-only cookie — the store holds only the decoded user object, never the token.

| Item | Type | Description |
|------|------|-------------|
| `user` | state | Current user (`User \| null`) |
| `isLoading` | state | In-flight login request |
| `isAuthenticated` | getter | `true` when `user` is set |
| `role` | getter | `Role \| null` |
| `isAdmin` | getter | Role is `admin` |
| `isSales` | getter | Role is `sales` **or** `admin` |
| `isSEO` | getter | Role is `seo` **or** `admin` |
| `isCustomer` | getter | Role is `customer` |
| `login(email, password)` | action | `POST /api/auth/login` |
| `logout()` | action | `POST /api/auth/logout`, clears `user` |
| `fetchCurrentUser()` | action | `GET /api/auth/me`; clears `user` on failure |

Note `isSales` and `isSEO` are true for admins too, so an admin passes every
role check.

## `stores/tours.ts`

Public tour browsing plus dashboard CRUD.

| Item | Type | Description |
|------|------|-------------|
| `tourList` | state | Public tours |
| `dashboardTours` | state | Tours loaded for the dashboard |
| `isLoading`, `dashboardLoading`, `error` | state | Request state |
| `wishlistIds` | state | Wishlisted tour **slugs** |
| `filters` | state | Active filter criteria |
| `filteredTours` | getter | `tourList` after filters |
| `featuredTours` | getter | Featured subset |
| `isInWishlist(slug)` | action | Membership check |
| `toggleWishlist(slug)` | action | Add/remove |
| `setFilter()`, `clearFilters()` | action | Filter management |
| `fetchDashboardTours()`, `fetchDashboardTour(id)` | action | Dashboard reads |
| `createDashboardTour()`, `updateDashboardTour()`, `deleteDashboardTour()` | action | Dashboard writes |

> Public pages do **not** read tours from this store — they use the `useTours()`
> / `useTour()` composables, which fetch through `useAsyncData`. The store backs
> the wishlist and the dashboard.

## `stores/bookings.ts`

Dashboard booking management.

| Item | Type | Description |
|------|------|-------------|
| `bookings`, `tourOptions` | state | Loaded records; tour dropdown options |
| `loading`, `error` | state | Request state |
| `statusCounts` | getter | Bookings grouped by status |
| `fetchBookings()`, `fetchBooking(id)`, `fetchTourOptions()` | action | Reads |
| `updateStatus()`, `createBooking()` | action | Writes |

## `stores/leads.ts`

Dashboard lead management.

| Item | Type | Description |
|------|------|-------------|
| `leads` | state | Loaded leads |
| `loading`, `error` | state | Request state |
| `statusCounts` | getter | Leads grouped by status |
| `fetchLeads()`, `fetchLead(id)` | action | Reads |
| `updateStatus()`, `addNote()`, `createManualLead()` | action | Writes |

## `stores/ui.ts`

Cross-app UI state.

| Item | Type | Description |
|------|------|-------------|
| `mobileMenuOpen` | state | Mobile menu visibility |
| `toastQueue` | state | Active toasts (`id`, `message`, `type`) |
| `openMobileMenu()`, `closeMobileMenu()` | action | Explicit open/close — there is no toggle |
| `addToast(message, type?)` | action | Queues a toast; auto-clears after 4s |
| `clearToast(id)` | action | Removes one toast |

`type` is `"success" | "error" | "info"`, defaulting to `"info"`.
