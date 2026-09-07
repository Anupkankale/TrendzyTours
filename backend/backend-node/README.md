# Trendzy Tours API — Node.js

A Node.js + Express + MongoDB port of the Laravel backend in `../`. It serves the
same routes, with the same request and response shapes, so the Nuxt frontend at
the repo root talks to it **without a single frontend change** — only
`NUXT_PUBLIC_API_BASE` moves.

The Laravel backend is untouched and still runnable; nothing has been deleted.

```
Nuxt frontend  ──HTTPS──▶  Node + Express  ──▶  MongoDB Atlas
trendzytours.com           api.trendzytours.com
```

## Stack

| Layer | Choice |
|---|---|
| Runtime | Node 20+, ES modules, no build step |
| Framework | Express 5 |
| Database | MongoDB (Atlas free tier), Mongoose 8 |
| Auth | `jsonwebtoken` (HS256) in an httpOnly cookie, `bcryptjs` |
| Validation | zod, translated into Laravel-shaped 422 bodies |
| Email | Brevo transactional API |
| Hardening | helmet, CORS allow-list, login rate limit |

## Setup

```bash
cd backend/backend-node
npm install
cp .env.example .env      # fill in MONGODB_URI and JWT_SECRET
npm run seed              # 3 users, 8 tours, 6 destinations, 5 testimonials, 8 bookings
npm run dev               # http://localhost:5000
```

Seeded logins: `admin@trendzytours.com` / `admin123`, `sales@trendzytours.com` /
`sales123`, `seo@trendzytours.com` / `seo12345`.

Point the frontend at it from the repo root:

```bash
NUXT_PUBLIC_API_BASE=http://localhost:5000 npm run dev
```

No MongoDB handy? A throwaway local one is enough for development:

```bash
docker run -d --name trendzy-mongo-dev -p 27017:27017 mongo:7
# MONGODB_URI=mongodb://127.0.0.1:27017/trendzytours
```

### Environment

| Variable | Notes |
|---|---|
| `MONGODB_URI` | Required. Atlas SRV string including the database name. |
| `JWT_SECRET` | Required. **Copy the Laravel value** — sharing it keeps existing sessions valid across the cutover. |
| `JWT_TTL` | Minutes, default `10080` (7 days), same as Laravel. |
| `FRONTEND_URL` | CORS allow-list; comma-separated for several origins. |
| `COOKIE_DOMAIN` | Blank locally; `.trendzytours.com` in production so the cookie is shared with the API subdomain. |
| `COOKIE_SAMESITE` / `COOKIE_SECURE` | `lax` / `true` in production. Only go `none` + `secure` if the frontend ends up on a different registrable domain. |
| `OTP_REQUIRED` | Whether `/api/contact` demands an OTP-verified email. Defaults to **true**; set `false` to accept submissions without verification. |
| `BREVO_*` | Transactional email and newsletter list. |
| `MYSQL_*` | Only read by `scripts/migrate-from-mysql.js`. |

## Routes

Identical to `../routes/api.php`.

| Method | Path | Guard |
|---|---|---|
| GET | `/` , `/up` | — (health) |
| POST | `/api/otp/send`, `/api/otp/verify` | public |
| GET | `/api/tours`, `/api/tours/:slug` | public, published only |
| POST | `/api/contact`, `/api/newsletter` | public |
| POST | `/api/auth/login`, `/api/auth/logout` | public |
| GET | `/api/auth/me` | authenticated |
| GET POST | `/api/leads` | admin, sales |
| GET PUT | `/api/leads/:id` | admin, sales |
| GET POST | `/api/bookings` | admin, sales |
| GET PUT | `/api/bookings/:id` | admin, sales |
| GET POST | `/api/admin/tours` | admin |
| GET PUT DELETE | `/api/admin/tours/:id` | admin |

`GET /api/tours` accepts `category`, `region` and `featured` query filters.

### Contact-form verification

By default `/api/contact` requires an `emailToken` from `/api/otp/verify`, for
the same address — the Laravel behaviour. Setting `OTP_REQUIRED=false` makes the
token optional: `/api/otp/send` and `/api/otp/verify` keep working, a valid
token is still consumed so it cannot be replayed, and everything else on the
payload is still validated. Only the *requirement* goes away.

> The Nuxt contact form also refuses to submit until it holds a token
> (`composables/useContactForm.ts`), so turning the flag off unblocks the API
> but not yet the UI. The frontend needs a matching switch before the form can
> be completed without a code.

Creating a lead, booking or tour answers **201**; everything else answers 200.
Validation failures answer **422** with `{ message, errors: { field: [...] } }`,
the wording Laravel used (`The price per person field is required.`) — attribute
names are humanised in the text while the `errors` keys stay camelCase.

## Data model

MongoDB collapses four MySQL tables into two documents:

- `tour_gallery` and `tour_itineraries` are **embedded** in `tours` as
  `gallery: [String]` and `itinerary: [{ day, title, description, meals, accommodation }]`.
  The old wipe-and-recreate `syncGallery`/`syncItinerary` transaction becomes a
  plain array assignment, and deleting a tour drops them for free.
- `lead_notes` is **embedded** in `leads` as `notes: [...]`.

`users`, `tours`, `leads`, `bookings` and embedded lead notes keep **string UUID
`_id`s**, so migrated rows keep their ids, existing tour URLs keep working and
the frontend's `uuid` validation on `tourId` still holds.

`otp_verifications` gains a 24-hour TTL index on `createdAt` (Laravel never
purged those rows). The TTL deliberately does *not* hang off `expiresAt`: a
verified `email_token` has to outlive the 10-minute OTP window, because the
contact form is submitted after it.

## Migrating from MySQL

```bash
npm run migrate -- --dry-run   # read and report, write nothing
npm run migrate                # upsert by _id — safe to re-run
```

Preserves UUIDs, timestamps, statuses and bcrypt password hashes, and folds the
gallery, itinerary and lead-note tables into their parents. `otp_verifications`
is skipped — those rows expire within ten minutes.

Set `MYSQL_HOST/PORT/DATABASE/USER/PASSWORD` first. Timestamps are read as UTC
because `../config/app.php` pins the Laravel app to UTC (the
`APP_TIMEZONE=Asia/Kolkata` line in `../.env` was never applied); override with
`MYSQL_TIMEZONE` if that ever changes.

## Tests

```bash
npm test
```

114 tests over `node:test` + supertest, run against a throwaway in-memory
MongoDB — no Docker, no network, no Laravel backend required. Set
`MONGODB_TEST_URI` to use a real throwaway server instead, for CI images that
cannot download the `mongod` binary.

`tests/setup.js` is preloaded and assigns `MONGODB_URI`, `JWT_SECRET` and
`BREVO_API_KEY` unconditionally, so the suite can never reach a real Atlas
cluster or send real email even if your `.env` is populated.

| Area | Covers |
|---|---|
| `unit/date` | the six-digit fractional seconds Carbon emitted, UTC date rendering |
| `unit/serializers` | the exact field set of `types/tour.ts`, numeric casts, the `—` / `""` fallback for a deleted tour, note ordering, password never serialised |
| `unit/validators` | Laravel's message wording, humanised attribute names, the `(and N more errors)` suffix, the three-way `groupSize` required errors, `gte` rendering the other field's value, numeric-string coercion |
| `integration/auth` | login against a **real PHP `$2y$` bcrypt hash**, case-insensitive email, httpOnly cookie, claim set, a token shaped by tymon/jwt-auth still being accepted, expiry and tampering, deleted user |
| `integration/rbac` | the full role × route matrix, including writes |
| `integration/tours` | published-only filtering, query filters, `filled()` semantics, no `data` envelope |
| `integration/adminTours` | 201 on create, embedded gallery/itinerary round-trip, slug uniqueness ignoring self, partial update, delete guarded by bookings |
| `integration/leads` | manual source forced, note authorship, accumulation order, the 400 for an empty update |
| `integration/bookings` | 201 on create, defaults, numeric strings from the form, unknown tour, past travel date, populated tour after update |
| `integration/otpContact` | expiry window, per-email throttle, single-use codes and tokens, email mismatch, lead creation |
| `integration/otpDisabled` | `OTP_REQUIRED=false`: submissions without a token, tokens still consumed, the rest of the payload still validated |
| `integration/loginThrottle` | that only *failed* logins consume the budget |

The `$2y$` fixtures in `tests/helpers/factories.js` were produced by PHP's
`password_hash(…, PASSWORD_BCRYPT, ['cost' => 12])` — byte for byte what
`Hash::make()` wrote into MySQL — so the suite proves migrated passwords still
verify, prefix and all.

## Parity harness

`tests/parity/compare.sh` runs the same request against both backends and diffs
the normalised JSON and the status code.

```bash
# Laravel on :8888 — Docker not required, the PHP CLI is enough
docker run -d --name trendzy-parity-mysql -p 3308:3306 \
  -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=trendzy_parity mysql:8.4
cd .. && DB_HOST=127.0.0.1 DB_PORT=3308 DB_DATABASE=trendzy_parity \
  DB_USERNAME=root DB_PASSWORD=password php artisan migrate --seed --force
cd .. && DB_HOST=127.0.0.1 DB_PORT=3308 DB_DATABASE=trendzy_parity \
  DB_USERNAME=root DB_PASSWORD=password php artisan serve --port=8888 &

# Node on :5000, freshly seeded
cd backend/backend-node && npm run seed && npm run dev &

npm run parity
```

Both databases must be freshly seeded, and the Node server must run with
`OTP_REQUIRED=true` — Laravel always demanded the token, so the harness's
contact cases assume it. Ids and timestamps generated by the seeders are
blanked before diffing; everything else must match byte for byte.

Last run: **41 cases pass, 0 fail, 3 differences by design.**

`npm test` is the everyday gate; the harness is the cutover gate, and needs
the Laravel backend alive to run at all.

### Deliberate differences from Laravel

| Area | Laravel | Here | Why |
|---|---|---|---|
| 404 body | `No query results for model [App\Models\Tour] <id>` | `{"message":"Not found"}` | Echoing a PHP class name from a Node service is meaningless and leaks internals. Status codes match; no frontend code reads the text. |
| Unknown route | `The route api/x could not be found.` | `{"message":"Not found"}` | Same reasoning. |
| Login throttle | none | 30 failed attempts / 15 min / IP | Brute-force protection. Successful logins are not counted, so normal use — including several people behind one office IP — is unaffected. |
| OTP delivery | `Mail::html` via the `log` mailer, so nothing was ever delivered | Brevo transactional API | The old configuration silently dropped every OTP email. Without `BREVO_API_KEY` the code is printed to the console in development and the request fails in production, rather than pretending to have sent. |
| Spent OTP rows | kept forever | 24-hour TTL index | Housekeeping. |
| Logout | server-side token invalidation | clears the cookie | JWTs are stateless here; a stolen token stays valid until it expires. Keep `JWT_TTL` short if that matters, or add a deny-list. |

One known cosmetic gap: when `groupSize` is present but a *nested* itinerary day
fails validation, Laravel reports the array index (`itinerary.0.title`) — this
port does too, but Laravel additionally reports some parent-level rules that zod
folds into a single issue. The `errors` keys and status always match.

## Layout

```
src/
  config/       env.js (fail-fast on missing vars), database.js
  models/       Mongoose schemas — one per Eloquent model
  serializers/  1:1 with ../app/Http/Resources/*.php
  validators/   zod schemas mirroring each controller's ->validate()
  controllers/  one per Laravel controller
  routes/       one per resource, mounted by routes/index.js
  middleware/   auth, role, validate, errors, rate limit
  services/     brevoService.js, cookieService.js
  utils/        ApiError, date formatting, Laravel message strings
scripts/        seed.js, migrate-from-mysql.js, data/
tests/
  setup.js      env pinned before src is imported
  helpers/      in-memory database, factories, logged-in supertest agents
  unit/         serializers, validators, date formatting
  integration/  every route, over a real in-memory MongoDB
  parity/       compare.sh, normalize.js — diffs live Laravel against live Node
```

## Deploying to Hostinger Web Apps

1. Push this directory to GitHub and point a Hostinger Web App at it.
2. Node 20+, install command `npm ci`, start command `node server.js`.
3. Set the environment variables from the table above in the Hostinger panel —
   `NODE_ENV=production`, `COOKIE_SECURE=true`,
   `COOKIE_DOMAIN=.trendzytours.com`, `FRONTEND_URL=https://trendzytours.com`,
   and `OTP_REQUIRED` to match whatever the frontend expects.
4. Allow Hostinger's egress IPs in the MongoDB Atlas network access list.
5. Map `api.trendzytours.com` to the app.
6. Run the migration once against Atlas, then set
   `NUXT_PUBLIC_API_BASE=https://api.trendzytours.com` on the frontend host.
7. Leave the Laravel backend running until the production walkthrough passes.
