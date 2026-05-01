# Backend Local Quickstart

This project uses a Laravel backend in `backend/` and runs it locally with Laravel Sail.

## Prerequisites

- Docker Desktop running
- Port `8888` available for Laravel
- Port `3307` available for MySQL

## First-Time Setup

From the project root:

```bash
cd backend
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate --seed
```

Use the migrate command if this is a fresh setup or the database has not been created yet.

## Daily Usage

Start the backend:

```bash
cd backend
./vendor/bin/sail up -d
```

View logs:

```bash
cd backend
./vendor/bin/sail logs -f
```

Stop the backend:

```bash
cd backend
./vendor/bin/sail down
```

## Verify It Works

The backend should be available at:

```text
http://localhost:8888
```

Check the tours API:

```bash
curl http://localhost:8888/api/tours
```

If it returns JSON, the backend is running correctly.

## Frontend Connection

The frontend root `.env` already points to the backend with:

```env
NUXT_PUBLIC_API_BASE=http://localhost:8888
```
