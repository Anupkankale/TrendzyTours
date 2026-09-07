# Local Development Setup

## Prerequisites

- Node.js >= 18
- npm >= 9

## Installation

```bash
# Clone the repo
git clone <repo-url>
cd tour-nuxt

# Install dependencies
npm install
```

## Running the Dev Server

```bash
npm run dev
```

The app starts at `http://localhost:3000` by default.

## Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

## Static Site Generation

```bash
npm run generate
```

Output goes to `.output/public/`.

## Type Checking

```bash
npm run typecheck
```

## Linting

```bash
npm run lint
```

ESLint uses `@antfu/eslint-config`. Husky runs lint-staged on pre-commit to enforce code quality automatically.

## Environment Variables

Copy `.env.example` to `.env` at the project root. Nuxt exposes these through
`useRuntimeConfig().public`.

```env
# Absolute origin of the API. Leave empty locally so nitro.devProxy forwards
# /api/** to the backend on localhost instead.
NUXT_PUBLIC_API_BASE=

# Canonical site origin. Drives canonicals, og:url and the sitemap; without it
# these emit localhost.
NUXT_PUBLIC_SITE_URL=https://trendzytours.com

WHATSAPP_NUMBER=91XXXXXXXXXX
```

The frontend holds no secrets — auth, email and the database all live behind
the API. See [deployment.md](./deployment.md) for the production values.
