# Authentication

## Overview

Authentication uses **JWT tokens** stored in an **httpOnly cookie** (`auth_token`). This prevents XSS token theft while allowing the browser to send credentials automatically.

---

## Flow

```
Browser                     Nuxt (SSR)              Laravel API
  │                             │                        │
  │── POST /api/auth/login ────►│── POST /api/auth/login►│
  │                             │                        │ validate credentials
  │                             │                        │ issue JWT
  │◄── Set-Cookie: auth_token ──│◄── Set-Cookie ─────────│
  │                             │                        │
  │── GET /dashboard ──────────►│                        │
  │                             │── GET /api/auth/me ───►│
  │                             │◄── { user, role } ─────│
  │◄── dashboard HTML ──────────│                        │
```

---

## Cookie Details

| Property | Value |
|----------|-------|
| Name | `auth_token` |
| HttpOnly | true |
| Secure | true (production) |
| SameSite | Lax |
| Path | `/` |
| TTL | 10080 minutes (7 days) |

---

## JWT Configuration (`config/jwt.php`)

| Setting | Value |
|---------|-------|
| Algorithm | HS256 |
| TTL | 60 min (access token) |
| Cookie TTL | 10080 min (7 days) |
| Blacklist | Enabled (logout invalidates token) |
| Secret | `JWT_SECRET` env variable |

---

## Middleware Chain

### `ParseJwtFromCookie`

`app/Http/Middleware/ParseJwtFromCookie.php`

Runs on every API request. Reads the `auth_token` cookie and injects it as:
```
Authorization: Bearer <token>
```
This bridges the cookie-based auth to what `tymon/jwt-auth` expects.

### `RoleMiddleware`

`app/Http/Middleware/RoleMiddleware.php`

Accepts a comma-separated list of allowed roles:
```php
Route::middleware(['auth:api', 'role:admin,sales'])->group(...)
```
Returns `403 Forbidden` if the authenticated user's role is not in the list.

---

## User Roles

| Role | Access |
|------|--------|
| `admin` | Full access — leads, user management |
| `sales` | Leads read/write |
| `seo` | Dashboard read-only (SEO analytics) |
| `customer` | Reserved for future booking features |

---

## Auth API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login, receive cookie |
| `POST` | `/api/auth/logout` | Invalidate token, clear cookie |
| `GET` | `/api/auth/me` | Get current user info |

See `docs/api.md` for request/response shapes.

---

## Frontend Integration

The Nuxt auth store (`stores/auth.ts`) calls these endpoints and stores user info in Pinia state. The `auth` middleware (`middleware/auth.ts`) reads the store to protect dashboard routes client-side. The Laravel `ParseJwtFromCookie` handles server-side protection.
