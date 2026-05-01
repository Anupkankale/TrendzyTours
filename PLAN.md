# Trendzy Tours — Feature Build Plan

> Track progress here. Pick one feature at a time, build it completely, then move to the next.

---

## Legend

- [ ] Not started
- [~] In progress
- [x] Done

---

## PHASE 1 — Complete the Dashboard (Iteration 2)

**Status:** [~] In progress

### [x] Feature 1 — Bookings List Page
**Route:** `/dashboard/bookings`  
**Who:** admin, sales  
**What to build:**
- Table of all bookings (tour name, customer name, travel date, pax count, status)
- Status badges: Pending / Confirmed / Cancelled
- Filter by status and date range
- Click row → booking detail drawer or page

**Files to create:**
- `pages/dashboard/bookings/index.vue`
- `pages/dashboard/bookings/[id].vue`
- `stores/bookings.ts`

---

### [x] Feature 2 — Tours CRUD (Dashboard)
**Route:** `/dashboard/tours`, `/dashboard/tours/create`, `/dashboard/tours/[id]/edit`  
**Who:** admin  
**What to build:**
- List all tours in a table (title, price, category, live/not-live toggle)
- Create tour form (title, slug, description, price, duration, images, category)
- Edit existing tour
- Manage whether a tour is live on public pages

**Files to create:**
- `pages/dashboard/tours/index.vue`
- `pages/dashboard/tours/create.vue`
- `pages/dashboard/tours/[id]/edit.vue`

---

### [ ] Feature 3 — Blog CMS (Dashboard)
**Route:** `/dashboard/blog`, `/dashboard/blog/create`, `/dashboard/blog/[id]/edit`  
**Who:** admin, seo  
**What to build:**
- List all blog posts with published/draft toggle
- Create post form (title, slug, content via markdown editor, SEO meta fields)
- Edit and delete post

**Files to create:**
- `pages/dashboard/blog/index.vue`
- `pages/dashboard/blog/create.vue`
- `pages/dashboard/blog/[id]/edit.vue`

---

### [ ] Feature 4 — Users Management (Dashboard)
**Route:** `/dashboard/users`  
**Who:** admin only  
**What to build:**
- List all registered users (name, email, role, joined date)
- Change user role dropdown (admin, sales, customer, seo)
- Deactivate / reactivate account

**Files to create:**
- `pages/dashboard/users/index.vue`
- `pages/dashboard/users/[id].vue`

---

## PHASE 2 — Public-Facing Booking Flow (Revenue Path)

### Feature 5 — Booking Enquiry Form on Tour Detail Page
**Route:** `/tours/[slug]` (add form to existing page)  
**Who:** any visitor  
**What to build:**
- Form: name, email, phone, travel date, number of adults/children, message
- On submit → send email via Brevo + save to bookings store/DB
- Thank you confirmation message
- WhatsApp CTA button alongside the form

**Files to edit:**
- `pages/tours/[slug].vue`
- `composables/useBookingForm.ts` (new)
- `server/api/booking.post.ts` (new)

---

### Feature 6 — WhatsApp Floating Button (Sitewide)
**Who:** all visitors  
**What to build:**
- Fixed bottom-right WhatsApp icon on all public pages
- Pre-filled message: "Hi Trendzy Tours, I'm interested in a tour."
- Configurable phone number in `nuxt.config.ts` or `.env`

**Files to create/edit:**
- `components/ui/WhatsAppButton.vue`
- `app.vue` (add globally)

---

### Feature 7 — Customer Dashboard (My Bookings)
**Route:** `/dashboard/my-bookings`  
**Who:** customer role  
**What to build:**
- Customer sees only their own submitted bookings
- Status of each booking (Pending / Confirmed / Cancelled)
- Option to cancel a pending booking

**Files to create:**
- `pages/dashboard/my-bookings/index.vue`

---

## PHASE 3 — Real Data Layer

### Feature 8 — Replace Static Seed Data with a Database
**What to build:**
- Set up SQLite (via `better-sqlite3`) or Supabase
- Migrate `/data/tours.ts` → DB table
- Migrate leads/bookings → DB table
- Update all server API routes to read/write from DB

**Files to create/edit:**
- `server/db/` (schema, client)
- All `server/api/` routes

---

### Feature 9 — Authentication Improvements
**What to build:**
- Registration page for new customers (`/register`)
- Forgot password flow (OTP via Brevo email)
- Session refresh (JWT sliding expiry)
- Rate limiting on login endpoint

**Files to create/edit:**
- `pages/register.vue`
- `pages/forgot-password.vue`
- `server/api/auth/register.post.ts`
- `server/api/auth/forgot-password.post.ts`

---

## PHASE 4 — SEO & Growth

### Feature 10 — Structured Data (JSON-LD) for Tours
**What to build:**
- Add `TouristTrip` JSON-LD schema to each tour detail page
- Add `LocalBusiness` JSON-LD schema to home/contact page
- Improves Google rich snippets

**Files to edit:**
- `pages/tours/[slug].vue`
- `pages/index.vue`
- `pages/contact.vue`

---

### Feature 11 — Google Reviews Section
**What to build:**
- Hardcoded or Google Places API pull of top reviews
- Star rating display on home + about page
- Fallback to static testimonials if API not configured

**Files to create/edit:**
- `components/home/GoogleReviews.vue`
- `pages/index.vue`
- `pages/about.vue`

---

### Feature 12 — Payment Integration (Razorpay)
**What to build:**
- Razorpay checkout on booking confirmation
- Webhook to update booking status on payment success
- Receipt email via Brevo after payment

**Files to create:**
- `composables/useRazorpay.ts`
- `server/api/payment/create-order.post.ts`
- `server/api/payment/webhook.post.ts`

---

## Build Order Summary

| # | Feature | Phase | Priority |
|---|---------|-------|----------|
| 1 | Bookings List Page | Dashboard | HIGH |
| 2 | Tours CRUD | Dashboard | HIGH |
| 3 | Blog CMS | Dashboard | HIGH |
| 4 | Users Management | Dashboard | MEDIUM |
| 5 | Booking Enquiry Form + Brevo | Public | HIGH |
| 6 | WhatsApp Floating Button | Public | HIGH |
| 7 | Customer My Bookings | Dashboard | MEDIUM |
| 8 | Real Database | Data Layer | HIGH |
| 9 | Auth Improvements | Auth | MEDIUM |
| 10 | JSON-LD Structured Data | SEO | MEDIUM |
| 11 | Google Reviews Section | SEO | LOW |
| 12 | Razorpay Payment | Payment | LOW |

---

> **Current Feature:** Feature 3 — Blog CMS  
> **Last Updated:** 2026-04-30
