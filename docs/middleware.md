# Middleware

Route middleware lives under `middleware/` and is applied per-page or globally.

## `auth.ts`

Protects routes that require a logged-in user.

- **No-ops unless the path starts with `/dashboard`** — it returns early for any
  other route, so adding it to a public page has no effect
- Reads `isAuthenticated` from the `auth` Pinia store
- Redirects to `/login` when not authenticated

**Usage in a page:**
```vue
<script setup>
definePageMeta({ middleware: 'auth' })
</script>
```

## `role.ts`

Extends auth protection with role-based access control.

- **Admins bypass every check** — `isAdmin` returns immediately
- Reads the allowed roles from route meta: `roles` (array), falling back to
  `requiredRole` (single). **If neither is set, the page is allowed** — the
  middleware only restricts pages that declare a requirement
- Redirects to `/dashboard` (not `/`) when the role doesn't match
- Used alongside `auth` on restricted dashboard pages

**Usage in a page:**
```vue
<script setup>
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['admin', 'sales'],   // or: requiredRole: 'sales'
})
</script>
```

Because `isSales` and `isSEO` in the auth store are also true for admins, an
admin passes every role gate.

> ### ⚠️ The role gate is currently inactive
>
> Every dashboard page declares its roles **nested** under a `meta` key:
>
> ```ts
> definePageMeta({ ..., meta: { roles: ["admin"] } })   // pages/dashboard/tours/index.vue
> ```
>
> But `definePageMeta` puts custom keys on `route.meta` *verbatim*, so this
> lands at `route.meta.meta.roles` — while `role.ts` reads `to.meta.roles`.
> Verified at runtime:
>
> ```
> definePageMeta({ meta: { roles: [...] }, topLevelRoles: [...] })
> → route.meta === { meta: { roles: [...] }, topLevelRoles: [...] }
> ```
>
> `allowedRoles` is therefore always `null`, and the middleware's
> `if (!allowedRoles) return` lets everyone through. **Any authenticated user
> reaches every dashboard page regardless of role** — a `customer` can open
> `/dashboard/tours` (admin-only) and `/dashboard/leads` (admin/sales).
>
> Fix either side: drop the `meta:` wrapper in the pages so it reads
> `roles: ["admin"]`, or change `role.ts` to read `to.meta.meta?.roles`. The
> first is more idiomatic. Seven pages are affected.
>
> Note this is a *defence-in-depth* gap, not necessarily an open door — whether
> data actually leaks depends on the Laravel API enforcing the same roles on
> `/api/admin/*`, `/api/leads` and `/api/bookings`. That should be confirmed
> independently.

## Middleware Execution Order

When both middleware are applied, Nuxt runs them in the array order:
1. `auth` — ensures user is logged in
2. `role` — ensures user has the correct role
