# Backend Overview

Trendzy Tours API is a Laravel 11 REST API backend serving the Nuxt 3 frontend. It handles authentication, tour data, contact leads, and newsletter subscriptions.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Laravel 11 |
| Language | PHP 8.5 |
| Database | MySQL 8.4 |
| Auth | tymon/jwt-auth (JWT via httpOnly cookie) |
| Email | Brevo (Sendinblue) API |
| Runtime | Docker via Laravel Sail |

## Architecture

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/      # AuthController, TourController, LeadController, ContactController, NewsletterController
│   │   ├── Middleware/       # ParseJwtFromCookie, RoleMiddleware
│   │   └── Resources/        # JSON API response shaping
│   ├── Models/               # Eloquent models
│   └── Providers/            # AppServiceProvider
├── bootstrap/app.php         # Middleware registration
├── config/                   # auth.php, cors.php, jwt.php
├── database/
│   ├── migrations/           # 8 custom migrations
│   └── seeders/              # Users, Tours, Destinations, Testimonials
└── routes/api.php            # All API route definitions
```

## Key Design Decisions

- **JWT via cookie** — Token stored in httpOnly `auth_token` cookie. `ParseJwtFromCookie` middleware bridges it to the `Authorization: Bearer` header that tymon/jwt-auth expects.
- **No resource wrapping** — `JsonResource::withoutWrapping()` in AppServiceProvider removes Laravel's default `{ "data": [] }` envelope so Nuxt receives plain arrays.
- **camelCase responses** — All API resources return camelCase field names to match TypeScript interfaces in the frontend.
- **UUID primary keys** — Users, Tours, Leads, and LeadNotes use UUIDs (`HasUuids` trait) instead of auto-increment integers.
- **Nuxt devProxy** — In development, all `/api/*` requests from Nuxt (port 3000) are proxied to Laravel (port 8888), keeping cookies same-origin.
