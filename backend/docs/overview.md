# Backend Overview

Trendzy Tours API is a Laravel 13 REST API backend serving the Nuxt 3 frontend. It handles authentication, tour data, contact leads, and newsletter subscriptions.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Laravel 13 |
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

## How to Start & Run the Backend Server

### Prerequisites
- Docker Desktop must be running
- Ports **8888** (app) and **3307** (MySQL) must be free

### First-Time Setup
```bash
cd backend
cp .env.example .env                        # 1. create env file
composer install --ignore-platform-reqs     # 2. install dependencies (if vendor/ missing)
./vendor/bin/sail up -d                     # 3. start Docker containers
./vendor/bin/sail artisan key:generate      # 4. generate app key
./vendor/bin/sail artisan jwt:secret        # 5. generate JWT secret
./vendor/bin/sail artisan migrate --seed    # 6. create tables + seed data
```

### Daily Commands
```bash
./vendor/bin/sail up -d        # start server (background)
./vendor/bin/sail down         # stop server
./vendor/bin/sail logs -f      # tail live logs
./vendor/bin/sail artisan ...  # run any artisan command
./vendor/bin/sail mysql        # open MySQL shell
```

### Verify It's Running
```bash
curl http://localhost:8888/api/tours
# Should return a JSON array of tours
```

### Backend URL
- Local: **http://localhost:8888**
- Nuxt frontend connects to it via `NUXT_PUBLIC_API_BASE=http://localhost:8888`

> For full setup details see `docs/setup.md`

---

## Key Design Decisions

- **JWT via cookie** — Token stored in httpOnly `auth_token` cookie. `ParseJwtFromCookie` middleware bridges it to the `Authorization: Bearer` header that tymon/jwt-auth expects.
- **No resource wrapping** — `JsonResource::withoutWrapping()` in AppServiceProvider removes Laravel's default `{ "data": [] }` envelope so Nuxt receives plain arrays.
- **camelCase responses** — All API resources return camelCase field names to match TypeScript interfaces in the frontend.
- **UUID primary keys** — Users, Tours, Leads, and LeadNotes use UUIDs (`HasUuids` trait) instead of auto-increment integers.
- **Nuxt devProxy** — In development, all `/api/*` requests from Nuxt (port 3000) are proxied to Laravel (port 8888), keeping cookies same-origin.
