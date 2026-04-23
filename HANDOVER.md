# Trendzy Tours — Project Handover

---

**Date:** 2026-04-23
**Time:** 21:30 IST (UTC+5:30)
**Author:** Anup Kankale

---

## Current Work (Active)

### Contact Form — Brevo SMTP OTP Verification (COMPLETE)

The contact form at `/contact` requires email verification before a lead is submitted. Verification uses a **6-digit OTP sent via Brevo SMTP**.

**How it works:**
1. User enters email → clicks **Send OTP**
2. Backend sends a 6-digit code to their inbox (expires in 10 minutes, max 3 requests per 10 minutes)
3. Six individual digit boxes appear — user types the code, auto-verifies on the 6th digit
4. Correct OTP → green ✓, boxes turn green, email field shows "Verified"
5. Wrong OTP → red ✗, boxes shake and clear after 1.5s for retry
6. User fills the rest of the form and submits — lead is created in the database

**Key files:**
- `composables/useContactForm.ts` — OTP send/verify flow, stores `email_token` after verification
- `pages/contact.vue` — contact form UI, uses `<UiAppOtpInput>` for the code entry
- `components/ui/AppOtpInput.vue` — 6-box PIN input component (auto-focus, paste, auto-verify)
- `backend/app/Http/Controllers/OtpController.php` — `POST /api/otp/send` and `POST /api/otp/verify`
- `backend/app/Services/EmailOtpService.php` — sends OTP email via Laravel `Mail::html()` (Brevo SMTP)
- `backend/app/Http/Controllers/ContactController.php` — validates `email_token` from `otp_verifications` table, creates `Lead`, sends admin notification

**Important Brevo SMTP credential note:**
The SMTP login is NOT the Brevo account email. It is a system-assigned address shown at:
**Brevo → Settings → SMTP & API → SMTP tab → "Login"**

```
MAIL_USERNAME=a8a8c5001@smtp-brevo.com   ← system login, not account email
MAIL_PASSWORD=xsmtpsib-...               ← SMTP key generated in Brevo dashboard
MAIL_FROM_ADDRESS=tradestrome@gmail.com  ← must be a verified sender in Brevo
```

---

## Project Scope

### Trendzy Tours — Travel Agency Website
**Domain:** trendzytours.com | **Location:** Nagpur, India

### Iteration 1 — Public Website (Complete)
| Page | Route | Status |
|------|-------|--------|
| Home | `/` | Done |
| About | `/about` | Done |
| Tours listing | `/tours` | Done |
| Tour detail | `/tours/[slug]` | Done |
| Destinations | `/destinations` | Done |
| Holidays | `/holidays` | Done |
| Blog | `/blog` | Done |
| Contact form | `/contact` | Done — Brevo SMTP OTP verified |
| Login | `/login` | Done |

### Iteration 2 — Role-Based Dashboard (In Progress)
| Page | Route | Status |
|------|-------|--------|
| Dashboard home | `/dashboard` | Scaffolded — stat cards are hardcoded, not wired to DB |
| Leads list | `/dashboard/leads` | Working — search, filter, stat cards, Add Lead modal |
| Lead detail | `/dashboard/leads/[id]` | Working — notes timeline, status change, quick actions |

**Roles:** `admin`, `sales`, `customer`, `seo`
**Auth:** JWT cookie — `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
**Access control:** `middleware/auth.ts` + `middleware/role.ts`

---

## Tech Stack

### Frontend (Nuxt 3)
- **Framework:** Nuxt 3.21.2 + TypeScript
- **Styling:** Tailwind CSS 3 — brand (#1e6c93), gold, dark, cream palettes (all in `tailwind.config.ts`)
- **Fonts:** Playfair Display (headings), Inter (body)
- **State:** Pinia (`stores/auth.ts`, `stores/tours.ts`, `stores/ui.ts`, `stores/leads.ts`)
- **Forms:** vee-validate + zod
- **Content:** @nuxt/content — markdown blog posts in `content/blog/`
- **Images:** @nuxt/image (webp/avif)

### Backend (Laravel — `backend/`)
- **Framework:** Laravel (PHP), Docker/Sail on port `8888`
- **Auth:** JWT (`tymon/jwt-auth`) + custom `ParseJwtFromCookie` middleware
- **OTP emails:** Laravel `Mail::html()` → Brevo SMTP (`smtp-relay.brevo.com:587`)
- **Lead notification emails:** Brevo REST API (`BREVO_API_KEY`)
- **Database:** MySQL (Docker, port 3307 on host)

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tours` | All tours |
| GET | `/api/tours/{slug}` | Single tour |
| POST | `/api/otp/send` | Send 6-digit OTP (rate limited: 3/10 min) |
| POST | `/api/otp/verify` | Verify OTP → returns `email_token` UUID |
| POST | `/api/contact` | Validate `email_token`, create Lead, notify admin |
| POST | `/api/newsletter` | Newsletter signup (Brevo) |
| POST | `/api/auth/login` | Login → JWT cookie |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Current user |
| GET | `/api/leads` | List leads (admin/sales only) |
| POST | `/api/leads` | Create lead manually (admin/sales only) |
| GET | `/api/leads/{id}` | Lead detail (admin/sales only) |
| PUT | `/api/leads/{id}` | Update status or add note (admin/sales only) |

---

## Environment Setup

### Frontend `.env` (project root)
```
NUXT_PUBLIC_API_BASE=http://localhost:8888
```

### Backend `.env` (`backend/.env`)
```
# Database
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=sail
DB_PASSWORD=password

# JWT
JWT_SECRET=...

# Brevo SMTP — OTP emails to users
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=a8a8c5001@smtp-brevo.com
MAIL_PASSWORD=xsmtpsib-...
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=tradestrome@gmail.com
MAIL_FROM_NAME="Trendzy Tours"

# Brevo REST API — admin notification on new lead
BREVO_API_KEY=xkeysib-...

APP_PORT=8888
```

### Dev Commands
```bash
# Frontend — always run from project root
npm run dev        # http://localhost:3000

# Backend — all artisan commands must run INSIDE Docker
docker exec backend-laravel.test-1 php artisan migrate
docker exec backend-laravel.test-1 php artisan config:clear

# Test SMTP
docker exec backend-laravel.test-1 php artisan tinker --execute="Mail::raw('Test', fn(\$m) => \$m->to('tradestrome@gmail.com')->subject('Test')); echo 'OK';"
```

---

## Known Issues / Pending
- **Dashboard home stat cards** are hardcoded — needs real DB queries
- **`noreply@trendzytours.com`** not yet a verified sender in Brevo — currently using `tradestrome@gmail.com` as `MAIL_FROM_ADDRESS`
- **Domain SPF/DKIM** not configured on trendzytours.com for Brevo — first emails may land in spam
