# Models & Business Logic

All models are in `app/Models/`. Primary keys are UUIDs via Laravel's `HasUuids` trait (except gallery/itinerary/destination/testimonial which use auto-increment).

---

## User

**File**: `app/Models/User.php`

Extends `Authenticatable`. Implements `JWTSubject` for tymon/jwt-auth.

```
id          uuid
name        string
email       string (unique)
password    string (bcrypt)
role        enum: admin | sales | customer | seo
```

**Key methods:**
- `getJWTIdentifier()` — returns `id` for JWT subject
- `getJWTCustomClaims()` — returns `['role' => $this->role]` (role is embedded in the token)

---

## Tour

**File**: `app/Models/Tour.php`

```
id           uuid
title        string
slug         string (unique)
description  text
category     string
region       string
price        decimal
duration     int (days)
featured     boolean
cover_image  string
is_active    boolean
```

**Relationships:**
- `gallery()` → hasMany TourGallery, ordered by `position`
- `itinerary()` → hasMany TourItinerary, ordered by `day`
- `testimonials()` → hasMany Testimonial

---

## TourGallery

**File**: `app/Models/TourGallery.php`

```
id          bigint
tour_id     uuid (FK)
image_url   string
caption     string (nullable)
position    int
```

---

## TourItinerary

**File**: `app/Models/TourItinerary.php`

```
id              bigint
tour_id         uuid (FK)
day             int
title           string
description     text
meals           json (array)
accommodation   string (nullable)
```

---

## Lead

**File**: `app/Models/Lead.php`

```
id          uuid
name        string
email       string
phone       string (nullable)
message     text
tour_slug   string (nullable)
status      enum: new | contacted | qualified | converted | lost
```

**Relationships:**
- `notes()` → hasMany LeadNote, ordered by `created_at` desc

**Default status**: `new` on creation.

---

## LeadNote

**File**: `app/Models/LeadNote.php`

```
id          uuid
lead_id     uuid (FK)
user_id     uuid (FK → users)
note        text
created_at  timestamp (no updated_at — immutable)
```

Notes are append-only. No `updated_at` column. Once written they cannot be edited.

**Relationships:**
- `author()` → belongsTo User

---

## Destination

**File**: `app/Models/Destination.php`

```
id           bigint
name         string
slug         string (unique)
region       string
description  text
image_url    string
is_featured  boolean
```

---

## Testimonial

**File**: `app/Models/Testimonial.php`

```
id          bigint
name        string
location    string
rating      tinyint (1–5)
review      text
tour_id     uuid (FK, nullable)
is_active   boolean
```

---

## API Resources (JSON Shaping)

Resources in `app/Http/Resources/` transform models into API responses:

| Resource | Output notes |
|----------|-------------|
| `UserResource` | id, email, name, role |
| `TourResource` | camelCase fields, nested gallery + itinerary |
| `TourItineraryResource` | day, title, description, meals (array), accommodation |
| `LeadResource` | lead fields + nested `LeadNoteResource` array |
| `LeadNoteResource` | note, author name, ISO 8601 createdAt |

`JsonResource::withoutWrapping()` is called in `AppServiceProvider` — no `data` envelope in responses.
