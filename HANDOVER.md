# Trendzy Tours — Project Handover

---

**Date:** 2026-04-22
**Time:** 20:41 IST (UTC+5:30)
**Author:** Anup Kankale

---

## Problem Statement

The contact form on `/contact` requires users to verify their email address before submitting an enquiry. The goal is to prevent spam leads and ensure only real email addresses reach the CRM.

**Issues encountered during this session:**

1. **OTP email not delivered** — The backend OTP system (using Brevo API) was failing silently. Root cause: Brevo SMTP not activated on the account, causing a `403 Forbidden` error on every send attempt.
2. **OTP input field missing** — The frontend had no visible input field for users to enter a code. The UI only showed a "Verify Email" button with no follow-up step.
3. **Firebase magic link going to spam** — After switching to Firebase email link verification, emails were received but landed in Gmail spam. The email showed `project-987082261276` instead of "Trendzy Tours" due to the Firebase project not being renamed.
4. **No email received at all (initially)** — Firebase Email Link sign-in was not enabled in Firebase Console, causing Firebase to silently reject send requests.

**Decision:** Settled on Firebase Email Link verification (magic link). OTP backend code is built and routed but the UI uses Firebase links. Firebase Console branding fixes are still pending.

---

## Current Work (Active)

### Email Verification on Contact Form
The contact form at `/contact` requires email verification before a lead can be submitted. The current implementation uses **Firebase Email Link (passwordless sign-in)**.

**How it works:**
1. User fills their email and clicks **"Verify Email"**
2. Firebase sends a sign-in link to their inbox
3. User clicks the link → redirected back to `/contact`
4. Page auto-detects the Firebase link, signs in, marks email as verified
5. User completes and submits the form

**Status:** Code is working. Two Firebase Console actions still pending:
- Change public-facing project name from `project-987082261276` → `Trendzy Tours`
  - Firebase Console → Project settings → General → Public-facing name
- Customize email template to reduce spam risk
  - Firebase Console → Authentication → Templates → Sign-in link → Edit sender name & subject

**Key files:**
- `composables/useContactForm.ts` — sends Firebase link, handles return callback
- `pages/contact.vue` — contact form UI with verify button
- `backend/app/Http/Controllers/ContactController.php` — verifies Firebase ID token via `FirebaseService`
- `backend/app/Services/FirebaseService.php` — wraps Kreait Firebase SDK token verification
- `plugins/firebase.client.ts` — initializes Firebase app on client side

**Firebase project:** `trendzy-auth` (project ID), API key in `frontend/.env`

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
| Contact form | `/contact` | Done (see active work above) |
| Login | `/login` | Done |

### Iteration 2 — Role-Based Dashboard (In Progress)
| Page | Route | Status |
|------|-------|--------|
| Dashboard home | `/dashboard` | Scaffolded |
| Leads list | `/dashboard/leads` | Scaffolded |
| Lead detail | `/dashboard/leads/[id]` | Scaffolded |

**Roles:** `admin`, `sales`, `customer`, `seo`
**Auth:** JWT cookie — `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
**Access control:** `middleware/auth.ts` + `middleware/role.ts`

---

## Tech Stack

### Frontend (Nuxt 3)
- **Framework:** Nuxt 3.21.2 + TypeScript
- **Styling:** Tailwind CSS 3 — gold/dark/cream palette
- **Fonts:** Playfair Display (headings), Inter (body)
- **State:** Pinia (`stores/auth.ts`, `stores/tours.ts`, `stores/ui.ts`)
- **Forms:** vee-validate + zod
- **Auth (client):** Firebase (`firebase/auth`) — email link verification
- **Content:** @nuxt/content — markdown blog posts in `content/blog/`
- **Images:** @nuxt/image (webp/avif)

### Backend (Laravel — `backend/`)
- **Framework:** Laravel (PHP), running via Docker/Sail on port `8888`
- **Auth:** JWT (`tymon/jwt-auth`) + custom `ParseJwtFromCookie` middleware
- **Email verification:** Firebase Admin SDK (`kreait/firebase-php`)
- **Email delivery (leads notification):** Brevo API (`BREVO_API_KEY` in `backend/.env`)
- **Database:** MySQL (Docker)

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tours` | All tours |
| GET | `/api/tours/{slug}` | Single tour |
| POST | `/api/contact` | Contact form → creates Lead, requires Firebase token |
| POST | `/api/newsletter` | Newsletter signup |
| POST | `/api/auth/login` | Login → JWT cookie |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Current user |
| POST | `/api/otp/send` | Send OTP code (backend ready, not active in UI) |
| POST | `/api/otp/verify` | Verify OTP code (backend ready, not active in UI) |
| GET | `/api/leads` | List leads (admin/sales only) |
| POST | `/api/leads` | Create lead (admin/sales only) |
| GET | `/api/leads/{id}` | Lead detail (admin/sales only) |
| PUT | `/api/leads/{id}` | Update lead (admin/sales only) |

---

## Environment Setup

### Frontend `.env` (root)
```
NUXT_PUBLIC_API_BASE=http://localhost:8888
NUXT_PUBLIC_FIREBASE_API_KEY=...
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=trendzy-auth.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=trendzy-auth
NUXT_PUBLIC_FIREBASE_APP_ID=...
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
```

### Backend `.env` (`backend/.env`)
```
DB_CONNECTION=mysql
BREVO_API_KEY=...            # for lead notification emails
RESEND_API_KEY=...           # added but not active (OTP email, future use)
FIREBASE_CREDENTIALS=...     # path to firebase-service-account.json inside Docker
JWT_SECRET=...
APP_PORT=8888
```

### Dev Commands
```bash
# Frontend
npm run dev        # http://localhost:3000

# Backend (inside Docker)
php artisan migrate
php artisan config:clear
```

---

## Known Issues / Pending
- Firebase verification emails go to **spam** — fix by customising the email template in Firebase Console (see Current Work above)
- OTP backend (`/api/otp/send`, `/api/otp/verify`) is built and routed but the frontend uses Firebase magic link instead
- Brevo SMTP not activated — only used for lead notification emails to admin, may silently fail
- Dashboard pages are scaffolded but not fully implemented
