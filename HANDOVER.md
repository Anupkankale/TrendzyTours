# Trendzy Tours — Project Handover

---

**Date:** 2026-04-23
**Time:** 21:30 IST (UTC+5:30)
**Author:** Anup Kankale

---

## What Was Done Today (2026-04-23)

### Firebase → Brevo SMTP OTP (COMPLETE)

Replaced the Firebase Email Link (magic link) verification on the contact form with a proper **6-digit OTP via Brevo SMTP**. Firebase is no longer used for contact form verification.

**Root cause of previous Firebase issues:** Firebase magic links went to spam, couldn't be branded on free plan. Switched to Brevo SMTP which gives full control over the email template and sender name.

**Critical env fix discovered:** Brevo SMTP login is NOT your account email. It is a system-assigned address found at **Brevo → Settings → SMTP & API → Login**. The account for this project uses:
- `MAIL_USERNAME=a8a8c5001@smtp-brevo.com` ← Brevo-assigned SMTP login
- `MAIL_PASSWORD=xsmtpsib-...` ← SMTP key from Brevo dashboard
- `MAIL_FROM_ADDRESS=tradestrome@gmail.com` ← verified sender in Brevo

**Files changed:**
| File | What changed |
|------|-------------|
| `backend/.env` | MAIL_MAILER=smtp, MAIL_HOST=smtp-relay.brevo.com, PORT=587, correct credentials |
| `backend/app/Services/EmailOtpService.php` | Rewrote from Resend HTTP API to Laravel `Mail::html()` |
| `backend/app/Http/Controllers/ContactController.php` | Removed Firebase token check; now verifies `email_token` from `otp_verifications` table, deletes record after use |
| `composables/useContactForm.ts` | Removed all Firebase imports; full OTP flow: sendOtp → verifyOtp(otp) → emailToken |
| `pages/contact.vue` | Replaced Firebase magic link UI with `<UiAppOtpInput>` component |
| `components/ui/AppOtpInput.vue` | New component — 6 individual digit boxes |
| `tailwind.config.ts` | Added gold/cream color palettes + shake keyframe animation |

### New OTP Input Component (`components/ui/AppOtpInput.vue`)

A PIN-style input with the following behaviour:
- 6 individual boxes, one digit each
- Auto-focuses next box on digit entry
- Backspace moves to previous box
- Paste support — paste the full 6-digit code at once
- Arrow key navigation
- After the 6th digit is entered → **automatically calls verify** (no button press needed)
- **Verifying state:** spinner, boxes turn brand-blue (`#1e6c93`)
- **Correct OTP:** all boxes turn green + green ✓ circle → email shows "✓ Verified"
- **Wrong OTP:** all boxes turn red + shake animation + red ✗ circle → boxes clear after 1.5s for retry
- **Expired OTP:** red state, then form resets to "Send OTP" after 1.5s

**Props:** `status: "idle" | "verifying" | "verified" | "wrong"`
**Emits:** `complete(otp: string)`, `reset()`

### OTP Flow (How It Works End-to-End)

1. User enters email → clicks **Send OTP**
2. `POST /api/otp/send` → creates `otp_verifications` record (6-digit OTP, 10 min expiry, max 3 per 10 min rate limit) → Brevo SMTP sends branded email
3. Six digit boxes appear; user types code (auto-verifies on 6th digit)
4. `POST /api/otp/verify` → checks DB record, returns `email_token` (UUID)
5. `email_token` is stored in composable state
6. On form submit: `POST /api/contact` sends `emailToken` → backend validates UUID against `otp_verifications`, creates `Lead`, deletes OTP record, sends Brevo notification to admin

---

## Current Work (Active)

### Contact Form — OTP Email Verification
**Status: COMPLETE and working.**

The full flow has been tested end-to-end:
- OTP email arrives in inbox (Brevo SMTP, from `tradestrome@gmail.com`)
- 6-digit PIN input with auto-verify works
- Wrong OTP shows red shake + X
- Correct OTP shows green tick, form unlocks
- Lead is created in DB on submit

**Important:** OTP expires in 10 minutes. If user takes too long, the form auto-resets to "Send OTP" state and shows an expiry message.

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
| Contact form | `/contact` | Done — OTP verified via Brevo SMTP |
| Login | `/login` | Done |

### Iteration 2 — Role-Based Dashboard (In Progress)
| Page | Route | Status |
|------|-------|--------|
| Dashboard home | `/dashboard` | Scaffolded — stat cards are hardcoded, not wired to DB |
| Leads list | `/dashboard/leads` | Working — search, filter, stat cards, "Add Lead" modal |
| Lead detail | `/dashboard/leads/[id]` | Working — notes, status change, WhatsApp/email quick actions |

**Roles:** `admin`, `sales`, `customer`, `seo`
**Auth:** JWT cookie — `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
**Access control:** `middleware/auth.ts` + `middleware/role.ts`

---

## Tech Stack

### Frontend (Nuxt 3)
- **Framework:** Nuxt 3.21.2 + TypeScript
- **Styling:** Tailwind CSS 3 — brand (#1e6c93), gold, dark, cream palettes (all defined in `tailwind.config.ts`)
- **Fonts:** Playfair Display (headings), Inter (body)
- **State:** Pinia (`stores/auth.ts`, `stores/tours.ts`, `stores/ui.ts`, `stores/leads.ts`)
- **Forms:** vee-validate + zod
- **Content:** @nuxt/content — markdown blog posts in `content/blog/`
- **Images:** @nuxt/image (webp/avif)
- **Firebase:** `plugins/firebase.client.ts` still exists but is NOT used for contact form — can be removed in a future cleanup pass

### Backend (Laravel — `backend/`)
- **Framework:** Laravel (PHP), running via Docker/Sail on port `8888`
- **Auth:** JWT (`tymon/jwt-auth`) + custom `ParseJwtFromCookie` middleware
- **Email OTP:** Laravel `Mail::html()` → Brevo SMTP (`smtp-relay.brevo.com:587`)
- **Email notification (leads):** Brevo REST API (`BREVO_API_KEY`) — sends admin notification on new contact form submission
- **Database:** MySQL (Docker, port 3307 on host)

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tours` | All tours |
| GET | `/api/tours/{slug}` | Single tour |
| POST | `/api/otp/send` | Send 6-digit OTP to email (rate limited: 3 per 10 min) |
| POST | `/api/otp/verify` | Verify OTP → returns `email_token` UUID |
| POST | `/api/contact` | Contact form → validates `email_token`, creates Lead, sends admin email |
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
NUXT_PUBLIC_FIREBASE_API_KEY=...        # kept but not used for contact form
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=trendzy-auth.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=trendzy-auth
NUXT_PUBLIC_FIREBASE_APP_ID=...
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
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

# Brevo SMTP — for OTP emails sent to users
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=a8a8c5001@smtp-brevo.com   # ← Brevo SMTP login (NOT account email)
MAIL_PASSWORD=xsmtpsib-...               # ← SMTP key from Brevo dashboard
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=tradestrome@gmail.com  # must be a verified sender in Brevo
MAIL_FROM_NAME="Trendzy Tours"

# Brevo REST API — for admin notification emails on new leads
BREVO_API_KEY=xkeysib-...

# Firebase Admin (kept for potential future use)
FIREBASE_CREDENTIALS=/var/www/html/storage/firebase-service-account.json

APP_PORT=8888
```

### Dev Commands
```bash
# Frontend — run from project root (NOT from backend/)
npm run dev        # http://localhost:3000

# Backend — commands must run INSIDE the Docker container
docker exec backend-laravel.test-1 php artisan migrate
docker exec backend-laravel.test-1 php artisan config:clear
docker exec backend-laravel.test-1 php artisan cache:clear

# Test SMTP from inside container
docker exec backend-laravel.test-1 php artisan tinker --execute="Mail::raw('Test', fn(\$m) => \$m->to('tradestrome@gmail.com')->subject('Test')); echo 'OK';"
```

---

## Known Issues / Pending
- **Dashboard home stat cards** are hardcoded (fake numbers) — needs wiring to real DB counts
- **Firebase plugin** (`plugins/firebase.client.ts`) is still in the codebase but unused — safe to remove in a cleanup pass
- **`noreply@trendzytours.com`** is not yet a verified sender in Brevo — using `tradestrome@gmail.com` as `MAIL_FROM_ADDRESS` for now; switch once domain is authenticated in Brevo
- **Domain authentication (SPF/DKIM)** not set up on trendzytours.com for Brevo — first-send emails may land in spam
