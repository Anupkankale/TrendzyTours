# Backend Setup & Local Development

## Prerequisites

- Docker Desktop running
- No other service on ports **8888** (Laravel) or **3307** (MySQL)

---

## First-Time Setup

### 1. Create `.env`

```bash
cd backend
cp .env.example .env
```

Fill in required values (DB values are pre-configured for Sail):

| Variable | Required | Notes |
|----------|----------|-------|
| `JWT_SECRET` | Yes | Generated in step 4 |
| `BREVO_API_KEY` | Optional | Only for contact/newsletter emails |
| `BREVO_LIST_ID` | Optional | Newsletter list ID |
| `DB_*` | Pre-filled | Works as-is with Sail |

### 2. Install PHP Dependencies

Run once if `vendor/` does not exist:

```bash
docker run --rm \
  -u "$(id -u):$(id -g)" \
  -v "$(pwd):/var/www/html" \
  -w /var/www/html \
  laravelsail/php84-composer:latest \
  composer install --ignore-platform-reqs
```

### 3. Start Docker Containers

```bash
./vendor/bin/sail up -d
```

Starts two containers:
- `laravel.test` — PHP 8.5 app on **http://localhost:8888**
- `mysql` — MySQL 8.4 database

### 4. Generate Keys

```bash
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan jwt:secret
```

Both values are written directly into `backend/.env`.

### 5. Run Migrations & Seed Data

```bash
./vendor/bin/sail artisan migrate --seed
```

Creates 8 tables and seeds: 3 users, 30+ tours, destinations, testimonials.

---

## Daily Usage

```bash
# Start
./vendor/bin/sail up -d

# Stop
./vendor/bin/sail down

# View logs
./vendor/bin/sail logs -f

# Open MySQL shell
./vendor/bin/sail mysql
```

---

## Re-seed / Fresh Database

```bash
./vendor/bin/sail artisan migrate:fresh --seed
```

---

## Verify It's Working

```bash
curl http://localhost:8888/api/tours
```

Should return a JSON array of tour objects.

---

## Default Seed Users

| Email | Password | Role |
|-------|----------|------|
| admin@trendzytours.com | password | admin |
| sales@trendzytours.com | password | sales |
| seo@trendzytours.com | password | seo |

---

## Frontend Connection

The Nuxt frontend reads `NUXT_PUBLIC_API_BASE` from its `.env`. It is already set to:

```
NUXT_PUBLIC_API_BASE=http://localhost:8888
```

In development, Nuxt proxies `/api/*` requests to Laravel so cookies remain same-origin.
