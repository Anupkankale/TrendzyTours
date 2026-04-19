# Middleware

Route middleware lives under `middleware/` and is applied per-page or globally.

## `auth.ts`

Protects routes that require a logged-in user.

- Reads the auth state from the `auth` Pinia store
- If not authenticated, redirects to `/login`
- Applied on dashboard pages

**Usage in a page:**
```vue
<script setup>
definePageMeta({ middleware: 'auth' })
</script>
```

## `role.ts`

Extends auth protection with role-based access control.

- Checks `user.role` from the auth store
- Redirects to `/` (or an error page) if the user's role is insufficient
- Used alongside `auth` middleware on admin-only pages

**Usage in a page:**
```vue
<script setup>
definePageMeta({ middleware: ['auth', 'role'] })
</script>
```

## Middleware Execution Order

When both middleware are applied, Nuxt runs them in the array order:
1. `auth` — ensures user is logged in
2. `role` — ensures user has the correct role
