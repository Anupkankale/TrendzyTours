# Pinia Stores

All stores live under `stores/` and are auto-imported by Pinia + Nuxt.

## `stores/auth.ts`

Manages authentication state.

| Item | Type | Description |
|------|------|-------------|
| `user` | state | Current logged-in user object (or `null`) |
| `isAuthenticated` | getter | `true` when a user session exists |
| `login()` | action | Authenticates user, stores JWT via `jose` |
| `logout()` | action | Clears session and redirects to `/login` |

## `stores/tours.ts`

Manages tour data and filtering.

| Item | Type | Description |
|------|------|-------------|
| `tours` | state | Array of all tour objects |
| `filters` | state | Active filter criteria (destination, price, etc.) |
| `filteredTours` | getter | Tours after applying active filters |
| `fetchTours()` | action | Loads tour data (from `data/` or API) |

## `stores/ui.ts`

Manages UI state across the app.

| Item | Type | Description |
|------|------|-------------|
| `mobileMenuOpen` | state | Controls mobile menu visibility |
| `toggleMobileMenu()` | action | Toggles `mobileMenuOpen` |
