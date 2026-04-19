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

Create a `.env` file at the project root for any required secrets (e.g., API keys, JWT secret). Nuxt reads these automatically via `useRuntimeConfig()`.

```env
# Example
NUXT_JWT_SECRET=your-secret-here
```
