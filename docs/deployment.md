# Deployment

Production is split across two platforms, both deploying from this repo on
push. Neither needs a deploy script.

```
                    GitHub  (main)
                   /              \
        Vercel (root)         Hostinger Web App (backend/backend-node)
    trendzytours.com  ──HTTPS──▶  api.trendzytours.com  ──▶  MongoDB Atlas
```

The Laravel backend in `backend/` is **not deployed**. `backend/backend-node/`
serves production.

---

## API — Hostinger Web Apps

### Application settings

| Setting | Value |
|---|---|
| Source | this GitHub repo, branch `main` |
| Subdirectory | `backend/backend-node` |
| Node version | 22 |
| Build command | `npm run build` |
| Start command | `npm start` (`node server.js`) |
| Domain | `api.trendzytours.com` |

> **Hostinger always runs `npm run build`.** This app is pure ESM and compiles
> nothing, so `package.json` carries a deliberate no-op `build` script that
> echoes and exits 0. Without it the deploy fails with
> `npm error Missing script: "build"` — do not remove it as dead code.

`src/app.js` already sets `trust proxy`, so `req.protocol` and the login rate
limiter see the real client behind Hostinger's TLS termination.

### Environment variables

Set these in the Hostinger panel — never in the repo.

```
NODE_ENV=production
MONGODB_URI=<Atlas SRV, including the database name>
JWT_SECRET=<64 random chars>
JWT_TTL=10080
FRONTEND_URL=https://trendzytours.com
COOKIE_DOMAIN=.trendzytours.com
COOKIE_SAMESITE=lax
COOKIE_SECURE=true
BREVO_API_KEY=<optional>
BREVO_LIST_ID=<newsletter list id>
BREVO_SENDER_EMAIL=noreply@trendzytours.com
BREVO_NOTIFY_EMAIL=<inbox that receives leads>
```

`src/config/env.js` exits at boot if `MONGODB_URI` or `JWT_SECRET` is missing,
so a missing variable shows up as an app that will not start rather than as a
broken request later.

Brevo is **optional**. Without a key the lead notification email and the
newsletter sync are skipped silently and the contact form still records the
lead. It used to be a hard launch blocker via the email OTP; that feature was
removed, and `/api/contact` is rate limited instead (10 requests per hour per
IP).

### MongoDB Atlas

1. Create a cluster and a database user scoped to the `trendzytours` database.
2. Network Access → allow Hostinger's egress IPs. If those are not published
   for Web Apps, `0.0.0.0/0` with a strong database password is the practical
   fallback; the connection string is the real secret either way.
3. Vercel never touches Atlas — only the API does — so no Vercel IPs are needed
   in the allow-list.

---

## Frontend — Vercel

### Project settings

| Setting | Value |
|---|---|
| Source | this GitHub repo, branch `main` |
| Root directory | repo root (leave blank) |
| Framework preset | Nuxt.js |
| Build command | `npm run build` (default) |
| Node version | 22 — taken from `engines.node` in `package.json` |
| Domain | `trendzytours.com` |

Nitro auto-detects the Vercel preset from the build environment; there is no
`vercel.json` and none is needed. `image.provider` is `none`, so no sharp/IPX
native build happens.

### Environment variables

Set for the Production environment:

```
NUXT_PUBLIC_API_BASE=https://api.trendzytours.com
NUXT_PUBLIC_SITE_URL=https://trendzytours.com
WHATSAPP_NUMBER=917123578454
```

`NUXT_PUBLIC_API_BASE` is the single variable production cannot work without.
Unset, every `/api/*` call resolves against the Vercel origin and 404s —
`nitro.devProxy` exists only in dev. It also fixes a real SEO bug: with an
empty `apiBase`, server-side fetches on `/holidays/**` and `/destinations/**`
render zero tours, so crawlers see empty listing pages.

### Caching

`nuxt.config.ts` uses `isr` route rules, which the Vercel preset implements
natively:

| Route | Rule |
|---|---|
| `/about`, `/contact` | `prerender` — genuinely static |
| `/`, `/holidays/**` | `isr: 900` |
| `/destinations/**`, `/tours/**` | `isr: 3600` |
| `/blog/**` | `isr: 1800` |
| `/dashboard/**` | `ssr: false`, `X-Robots-Tag: noindex` |

`/` is revalidated rather than prerendered on purpose: a tour published from
the dashboard appears within 15 minutes instead of waiting for a redeploy.

> Do not swap `isr` for `swr` here. `swr` only reaches Vercel through a
> deprecated back-compat path in Nitro's preset. The reverse is also true — if
> this ever moves to a self-hosted Node server, `isr` becomes inert and the
> rules must become `swr`.

---

## Cookies and CORS

Both hosts sit under one registrable domain, which is what keeps this simple:

- `COOKIE_DOMAIN=.trendzytours.com` shares the `auth_token` cookie between the
  site and the API.
- `COOKIE_SAMESITE=lax` is sufficient — dashboard XHR to `api.trendzytours.com`
  is same-site. `SameSite=None` is not needed.
- `COOKIE_SECURE=true` requires TLS on both hostnames. Login fails silently
  until the API certificate is live.
- `FRONTEND_URL` must match the site origin exactly. `composables/useApi.ts`
  sends `credentials: "include"`, so the API must answer with
  `Access-Control-Allow-Credentials: true` and an explicit origin — a wildcard
  is rejected by the browser.

If the site is ever served from a `*.vercel.app` URL instead of the custom
domain, that becomes cross-site: `COOKIE_SAMESITE=none` and the exact
`vercel.app` origin in `FRONTEND_URL`, or the dashboard stops authenticating.

---

## CI

`.github/workflows/ci.yml` runs on every push to `main` and every pull request.
It does not deploy — Vercel and Hostinger do that themselves — it is the
quality gate that runs first:

- **Frontend:** `npm run typecheck`, `npm run lint`, `npm run build`. The build
  runs without `NUXT_PUBLIC_API_BASE`, so the sitemap source falls back to the
  `data/tours.ts` seed by design; this checks for build breakage, not data.
- **API:** `npm test` — 106 tests over `node:test` and supertest against an
  in-memory MongoDB. `tests/setup.js` pins env so the suite can never reach
  real Atlas or send real email.

### Rollback

Both platforms keep previous builds. On Vercel, promote the last good
deployment from the Deployments tab. On Hostinger, redeploy from the previous
commit. Neither requires a code change.

---

## First cutover

1. **Rehearse locally.** This is the first time the frontend talks to the Node
   backend rather than Laravel. The routes match 1:1, but verify before
   production does:

   ```bash
   cd backend/backend-node && npm test && npm run dev      # :5000
   cd ../.. && NUXT_PUBLIC_API_BASE=http://localhost:5000 npm run build && npm run preview
   ```

2. **Ship the API first**, then point Vercel at it. The frontend build reaches
   the live API to enumerate tours for the sitemap.

3. **Populate Atlas.** The production database starts empty.

   ```bash
   npm run seed -- --force            # 3 users, 8 tours, 6 destinations, …
   ```

   Then **rotate all three seeded passwords immediately** — `admin123`,
   `sales123` and `seo12345` are in a committed doc (`test-credentials.md`).

   If the local Laravel MySQL holds real tour content worth keeping, migrate
   instead. It upserts by `_id`, preserves UUIDs and bcrypt hashes, and is safe
   to re-run:

   ```bash
   npm run migrate -- --dry-run
   npm run migrate
   ```

---

## Verification

```bash
# API
curl -fsS https://api.trendzytours.com/up
curl -fsS https://api.trendzytours.com/api/tours | head -c 200     # real tours, not []

# Listing pages must render tours server-side, not an empty shell
curl -fsS https://trendzytours.com/holidays/ | grep -c 'tour-card'
curl -fsS https://trendzytours.com/destinations/ | grep -c 'tour-card'

# SEO
curl -fsS https://trendzytours.com/sitemap.xml                     # real slugs, no localhost
curl -fsS https://trendzytours.com/robots.txt
curl -fsSI https://trendzytours.com/login | grep -i x-robots-tag   # noindex, nofollow
curl -fsS https://trendzytours.com/ | grep -o 'rel="canonical"[^>]*'

# ISR — the second request should be served from cache
curl -sI https://trendzytours.com/tours/<slug> | grep -i x-vercel-cache   # MISS
curl -sI https://trendzytours.com/tours/<slug> | grep -i x-vercel-cache   # HIT
```

**Auth — in a real browser**, since curl will not tell you the truth about
cookies:

1. Log in at `/login` with the rotated admin password.
2. DevTools → Application → Cookies: `auth_token` on `.trendzytours.com`,
   `HttpOnly` ✓, `Secure` ✓, `SameSite=Lax`.
3. Load the dashboard; tours, leads and bookings should populate — that proves
   CORS plus `credentials: "include"` across the subdomain.
4. Log out; the cookie clears and `/dashboard` redirects.

**Contact form, end to end:**

1. Submit the form. It should accept immediately — there is no verification
   step.
2. The lead appears in the dashboard under Leads.
3. If `BREVO_API_KEY` is set, the notification lands at `BREVO_NOTIFY_EMAIL`.
   If it is not, the lead is still recorded — that is expected, not a failure.
4. Submit eleven times in an hour from one IP; the eleventh should answer 429.

---

## Known gaps

Decisions, not surprises. None blocks launch.

| Gap | Where | Note |
|---|---|---|
| Hard refresh on `/dashboard` bounces to `/login` | `stores/auth.ts`, `middleware/auth.ts` | Auth state is in-memory with no bootstrap, and `/dashboard/**` is `ssr: false`. A staff annoyance, not a hole — Express enforces the real guard. |
| No pagination on `/api/leads`, `/api/bookings`, `/api/admin/tours` | `backend/backend-node/src/controllers/` | Whole collection per request. Fine now; revisit as bookings accumulate. |
| Contact spam relies on rate limiting alone | `src/middleware/rateLimit.js` | With the OTP gone, `contactLimiter` (10/hour/IP) is the only guard on `/api/contact` and `/api/newsletter`. A distributed bot would get past it; add a captcha if that starts happening. |
| Lead notification email interpolates user input unescaped | `src/services/brevoService.js` | HTML injection into the internal mail. Low severity, worth fixing. |
| Stateless logout | by design | A stolen JWT stays valid up to `JWT_TTL` (7 days). |
| Laravel backend still in the repo, undeployed | `backend/` | Intentional. Decide whether to delete once the production walkthrough passes. |
