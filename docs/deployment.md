# Deployment — Step by Step

Follow these in order. Each step says how to verify it before you move on, so a
failure is caught where it happened rather than three steps later.

**Time:** about 60–90 minutes the first time, most of it waiting for DNS.

## What you end up with

```
                         GitHub  (main)
                        /               \
          Vercel (repo root)          Hostinger Web App (backend/backend-node)
        trendzytours.com  ──HTTPS──▶  api.trendzytours.com  ──▶  MongoDB Atlas
```

Both platforms rebuild on push. There is no deploy script and no deploy
secrets in GitHub.

The Laravel app in `backend/` is **not deployed**. `backend/backend-node/` is
what serves production.

## Before you start

| You need | Notes |
|---|---|
| The repo pushed to GitHub | Both platforms deploy from it |
| A Hostinger plan with Web Apps | The Node runtime for the API |
| A Vercel account | Free tier is fine |
| A MongoDB Atlas account | Free M0 tier is fine |
| Control of `trendzytours.com` DNS | You must be able to add records |
| A Brevo account | **Optional.** Skip it and the site still works — see Step 6 |

Order matters in one place: **the API goes up before the frontend**, because
the Vercel build calls the live API to enumerate tours for the sitemap.

---

# Part 1 — Database

## Step 1. Create the Atlas cluster

1. Atlas → **Build a Database** → **M0** (free).
2. Pick the region closest to Nagpur — Mumbai (`ap-south-1`) if offered.
3. Create a database user. Save the username and password.

## Step 2. Open network access

Atlas → **Network Access** → **Add IP Address**.

Add Hostinger's egress IPs. If Hostinger does not publish stable egress IPs for
Web Apps, use `0.0.0.0/0` and rely on the database password — the connection
string is the real secret either way.

> Vercel never touches Atlas. Only the API does, so no Vercel IPs are needed.

Skipping this step does **not** produce a clear error. The app boots normally
and then hangs on every request until the 10-second server-selection timeout.
If the API is up but every call is slow and then fails, come back here first.

## Step 3. Build the connection string

Atlas → **Connect** → **Drivers** gives you something like:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Two things to fix before using it:

1. **Insert the database name** before the `?`. Atlas omits it, and Mongoose
   silently connects to a database called `test` — the app works, looks
   correct, and writes everything to the wrong place.
2. **Percent-encode the password** if it contains `: / ? # [ ] @ %`.
   `p@ss` must become `p%40ss` or the URI parses wrong.

The finished string:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/trendzytours?retryWrites=true&w=majority
```

**Verify:** it ends with `/trendzytours?retryWrites=true&w=majority`.

---

# Part 2 — API on Hostinger

## Step 4. Create the Web App

Hostinger → **Web Apps** → create from GitHub.

| Setting | Value |
|---|---|
| Repository | this repo |
| Branch | `main` |
| **Subdirectory** | `backend/backend-node` |
| Node version | 22 |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Start command | `npm start` |

> **On the build command.** Hostinger always runs `npm run build`, even for an
> app that compiles nothing. This API is pure ESM and has no build step, so
> `package.json` carries a deliberate no-op `build` script that echoes and
> exits 0. Without it the deploy fails with `npm error Missing script:
> "build"`. Do not remove it as dead code.

If the subdirectory setting is missing from your panel, Hostinger will install
the Nuxt app's dependencies instead of the API's. A healthy install logs
roughly 200 packages; a four-figure number means it is building the wrong
directory.

## Step 5. Set the environment variables

In the app's environment settings:

```
NODE_ENV=production
MONGODB_URI=<the string from Step 3>
JWT_SECRET=<64 random characters>
JWT_TTL=10080
FRONTEND_URL=https://trendzytours.com
COOKIE_DOMAIN=.trendzytours.com
COOKIE_SAMESITE=lax
COOKIE_SECURE=true
```

Generate the secret with `openssl rand -base64 48`. Use a **new** one — do not
reuse your local development secret, and ignore the older advice about matching
Laravel's, which does not apply now that Laravel is not deployed.

`src/config/env.js` exits at boot if `MONGODB_URI` or `JWT_SECRET` is missing.
That is deliberate: a missing variable shows up as an app that will not start,
which you notice, rather than as broken requests later, which you might not.

## Step 6. Brevo (optional — you can skip this)

```
BREVO_API_KEY=
BREVO_LIST_ID=
BREVO_SENDER_EMAIL=noreply@trendzytours.com
BREVO_NOTIFY_EMAIL=<inbox that should receive leads>
```

Leave the key blank and the contact form still records every lead — only the
notification email and the newsletter sync are skipped, silently and by design.
Add the key whenever you want lead emails; no code change, just a restart.

## Step 7. Point the subdomain at the app

**First** add `api.trendzytours.com` as a custom domain inside the Web App.
Then create the DNS record. Doing it the other way round means the request
arrives and Hostinger serves a default page instead of your app.

Where you create the record depends on which nameservers are authoritative:

```bash
dig +short NS trendzytours.com
```

| Nameservers say | Create the record in |
|---|---|
| `ns1.dns-parking.com` (Hostinger) | hPanel → **Domains → DNS Zone Editor** |
| `ns1.vercel-dns.com` | Vercel → **Settings → Domains → DNS Records** |
| anything else | Wherever that provider's control panel is |

The record:

| Field | Value |
|---|---|
| Type | `A` |
| Name | `api` |
| Points to | the app's IP, shown in the Hostinger panel |
| TTL | default, or 300 while testing |

> Enter the name as `api`, **not** `api.trendzytours.com`. The panel appends
> the domain for you, and the full name produces
> `api.trendzytours.com.trendzytours.com`. This is the most common mistake in
> this whole document.

**Verify** before continuing — this can take a few minutes:

```bash
dig +short api.trendzytours.com
```

## Step 8. Issue the TLS certificate

In the app's SSL section, issue a Let's Encrypt certificate for
`api.trendzytours.com`. Do this **after** Step 7 verifies, because validation
happens over HTTP against the live record.

This is not cosmetic. `COOKIE_SECURE=true` means the browser refuses to store
the auth cookie over plain HTTP, so until the certificate exists, login appears
to succeed and then simply does not work, with nothing useful in the console.

**Verify:**

```bash
curl -fsS https://api.trendzytours.com/up
```

## Step 9. Seed the database

Atlas is empty, so `/api/tours` returns `[]` until you seed it. Run once, from
a shell where `MONGODB_URI` points at Atlas:

```bash
cd backend/backend-node
MONGODB_URI='<the string from Step 3>' npm run seed
```

That inserts 3 users, 8 tours, 6 destinations, 5 testimonials and 8 bookings.

> **`npm run seed` deletes every collection before inserting.** Its guard only
> trips on `NODE_ENV=production`, so it will happily wipe Atlas from a
> development shell. Run it once, here, and never from a terminal that has the
> Atlas URI lying around in its environment.

If you have real tour content in the local Laravel MySQL worth keeping, use the
migration instead — it upserts by `_id`, preserves UUIDs and bcrypt hashes, and
is safe to re-run:

```bash
npm run migrate -- --dry-run
npm run migrate
```

**Verify:**

```bash
curl -fsS https://api.trendzytours.com/api/tours | head -c 200
```

You should see real tours, not `[]`.

---

# Part 3 — Frontend on Vercel

## Step 10. Import the project

Vercel → **Add New → Project** → import the repo.

| Setting | Value |
|---|---|
| Framework preset | Nuxt.js |
| Root directory | leave blank (repo root) |
| Build command | `npm run build` (default) |
| Node version | 22 — read from `engines.node` |

No `vercel.json` is needed. Nitro detects the Vercel preset from the build
environment on its own.

## Step 11. Set the environment variables

For the **Production** environment:

```
NUXT_PUBLIC_API_BASE=https://api.trendzytours.com
NUXT_PUBLIC_SITE_URL=https://trendzytours.com
WHATSAPP_NUMBER=917123578454
```

`NUXT_PUBLIC_API_BASE` is the single variable production cannot work without.
Unset, every `/api/*` call resolves against the Vercel origin and 404s — the
dev proxy that makes this work locally does not exist in a production build.

It also fixes a real SEO bug: with an empty `apiBase`, server-side fetches on
`/holidays/**` and `/destinations/**` render **zero tours**, so crawlers index
empty listing pages.

## Step 12. Deploy and attach the domain

1. Deploy. The build calls the live API — which is why Part 2 came first.
2. **Settings → Domains** → add `trendzytours.com` and `www.trendzytours.com`.
3. Follow Vercel's instructions for the apex record, and add the certificate.

If you move the nameservers to Vercel at this point, **the `api` record from
Step 7 stops resolving** — it lives in the old zone. Recreate it in Vercel's
DNS with the same values, or the API disappears the moment the switch takes
effect.

**Verify:**

```bash
curl -fsSI https://trendzytours.com/ | head -1
```

---

# Part 4 — Go-live verification

## Step 13. Automated checks

```bash
# The bug this whole setup exists to fix: listing pages must render
# tours server-side, not an empty shell
curl -fsS https://trendzytours.com/holidays/ | grep -c 'tour-card'
curl -fsS https://trendzytours.com/destinations/ | grep -c 'tour-card'

# SEO
curl -fsS https://trendzytours.com/sitemap.xml            # real slugs, no localhost
curl -fsS https://trendzytours.com/robots.txt
curl -fsSI https://trendzytours.com/login | grep -i x-robots-tag    # noindex, nofollow
curl -fsS https://trendzytours.com/ | grep -o 'rel="canonical"[^>]*'

# ISR — the second request should be served from cache
curl -sI https://trendzytours.com/tours/<slug> | grep -i x-vercel-cache   # MISS
curl -sI https://trendzytours.com/tours/<slug> | grep -i x-vercel-cache   # HIT
```

## Step 14. Auth — in a real browser

curl will not tell you the truth about cookies, so do this by hand:

1. Log in at `/login` with `admin@trendzytours.com` / `admin123`.
2. DevTools → Application → Cookies: `auth_token` on `.trendzytours.com`,
   `HttpOnly` ✓, `Secure` ✓, `SameSite=Lax`.
3. Load the dashboard — tours, leads and bookings should populate. That is what
   proves CORS plus `credentials: "include"` works across the subdomain.
4. Log out; the cookie clears and `/dashboard` redirects.

## Step 15. Contact form

1. Submit the form. It should accept immediately — there is no verification
   step; the email OTP was removed.
2. The lead appears in the dashboard under Leads.
3. If `BREVO_API_KEY` is set, a notification reaches `BREVO_NOTIFY_EMAIL`. If
   it is not, the lead is still recorded — that is expected, not a failure.
4. Submit eleven times within an hour from one IP; the eleventh answers `429`.

---

# Part 5 — After launch

## Step 16. Rotate the seeded passwords

**Do this before you tell anyone the site is live.**

`admin123`, `sales123` and `seo12345` are in `docs/test-credentials.md`, which
is committed to the repository. Change all three from the dashboard.

## Step 17. Practise a rollback

Once, deliberately, while nobody is watching:

- **Vercel:** Deployments tab → an earlier build → **Promote to Production**.
- **Hostinger:** redeploy from the previous commit.

Neither needs a code change. Knowing the button works is worth five minutes.

---

# Appendix A — Environment variables

## API (Hostinger)

| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | yes | `production` |
| `MONGODB_URI` | **yes** | Atlas SRV string, database name included. App exits without it |
| `JWT_SECRET` | **yes** | HS256 signing key. App exits without it |
| `JWT_TTL` | no | Token lifetime in minutes, default 10080 (7 days) |
| `FRONTEND_URL` | yes | CORS allow-list. Comma-separated for several origins |
| `COOKIE_DOMAIN` | yes | `.trendzytours.com` — the leading dot shares the cookie |
| `COOKIE_SAMESITE` | yes | `lax` |
| `COOKIE_SECURE` | yes | `true` |
| `BREVO_*` | no | Lead email and newsletter. Skipped silently when unset |
| `PORT` | no | Panel-assigned; defaults to 5000 |

## Frontend (Vercel)

| Variable | Required | Purpose |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | **yes** | Absolute API origin |
| `NUXT_PUBLIC_SITE_URL` | yes | Canonicals, `og:url`, sitemap |
| `WHATSAPP_NUMBER` | no | WhatsApp CTA number |

# Appendix B — Cookies and CORS

Both hosts share one registrable domain, which is what keeps this simple:

- `COOKIE_DOMAIN=.trendzytours.com` shares `auth_token` between site and API.
- `COOKIE_SAMESITE=lax` is enough — dashboard XHR to `api.trendzytours.com` is
  same-site. `SameSite=None` is not needed.
- `COOKIE_SECURE=true` needs TLS on both hostnames.
- `FRONTEND_URL` must match the site origin exactly. The frontend sends
  `credentials: "include"`, so the API must answer with
  `Access-Control-Allow-Credentials: true` and an explicit origin — the
  browser rejects a wildcard.

**If the site ever runs on a `*.vercel.app` URL instead of the custom domain**,
that is cross-site: set `COOKIE_SAMESITE=none` and put the exact `vercel.app`
origin in `FRONTEND_URL`, or the dashboard stops authenticating.

# Appendix C — Caching

`nuxt.config.ts` uses `isr` route rules, native to the Vercel preset:

| Route | Rule |
|---|---|
| `/about`, `/contact` | `prerender` — genuinely static |
| `/`, `/holidays/**` | `isr: 900` |
| `/destinations/**`, `/tours/**` | `isr: 3600` |
| `/blog/**` | `isr: 1800` |
| `/dashboard/**` | `ssr: false`, `X-Robots-Tag: noindex` |

`/` is revalidated rather than prerendered on purpose: a tour published from
the dashboard appears within 15 minutes instead of waiting for a redeploy.

> Do not swap `isr` for `swr`. `swr` reaches Vercel only through a deprecated
> back-compat path in Nitro's preset. The reverse also holds — if this ever
> moves to a self-hosted Node server, `isr` becomes **inert** and the rules
> must become `swr`.

# Appendix D — CI

`.github/workflows/ci.yml` runs on every push to `main` and every pull request.
It does not deploy; the platforms do that themselves. It is the gate that runs
first:

- **Frontend:** `typecheck`, `lint`, `build`. The build runs without
  `NUXT_PUBLIC_API_BASE`, so the sitemap falls back to the `data/tours.ts` seed
  by design — this checks for build breakage, not data.
- **API:** `npm test` — 102 tests over `node:test` and supertest against an
  in-memory MongoDB. `tests/setup.js` pins env so the suite can never reach
  real Atlas or send real email.

# Appendix E — Troubleshooting

| Symptom | Cause |
|---|---|
| `npm error Missing script: "build"` | The no-op `build` script was removed from `backend/backend-node/package.json`, or the Web App points at the wrong subdirectory |
| Hostinger installs ~1000 packages | Subdirectory is not set to `backend/backend-node`; it is building the Nuxt app |
| App will not start, no request logs | `MONGODB_URI` or `JWT_SECRET` missing — `env.js` exits at boot on purpose |
| API up, every request slow then fails | Atlas Network Access does not allow the host (Step 2) |
| Site loads, every `/api/*` call 404s | `NUXT_PUBLIC_API_BASE` unset on Vercel |
| Listing pages render zero tours | Same cause — the server-side fetch has no absolute base |
| Login succeeds but nothing happens | Cookie rejected: TLS missing, `COOKIE_SECURE` mismatch, or `COOKIE_DOMAIN` wrong |
| Dashboard calls blocked by CORS | `FRONTEND_URL` does not exactly match the site origin |
| Hard refresh on `/dashboard` → `/login` | Known gap, see Appendix F |
| `api.trendzytours.com` stops resolving | Nameservers moved to Vercel; recreate the record there (Step 12) |
| Sitemap contains `localhost` | `NUXT_PUBLIC_SITE_URL` unset at build time |
| Contact form always 429 | Rate limit is 10/hour/IP; wait, or check for a retry loop |

# Appendix F — Known gaps

Decisions, not surprises. None blocks launch.

| Gap | Where | Note |
|---|---|---|
| Hard refresh on `/dashboard` bounces to `/login` | `stores/auth.ts`, `middleware/auth.ts` | Auth state is in-memory with no bootstrap, and `/dashboard/**` is `ssr: false`. A staff annoyance, not a hole — Express enforces the real guard |
| No pagination on `/api/leads`, `/api/bookings`, `/api/admin/tours` | `backend/backend-node/src/controllers/` | Whole collection per request. Fine now; revisit as bookings accumulate |
| Contact spam relies on rate limiting alone | `src/middleware/rateLimit.js` | With the OTP gone, `contactLimiter` (10/hour/IP) is the only guard. A distributed bot gets past it; add a captcha if that starts happening |
| Lead notification email interpolates user input unescaped | `src/services/brevoService.js` | HTML injection into the internal mail. Low severity, worth fixing |
| Stateless logout | by design | A stolen JWT stays valid up to `JWT_TTL` (7 days) |
| Laravel backend still in the repo, undeployed | `backend/` | Intentional. Decide whether to delete once the production walkthrough passes |
