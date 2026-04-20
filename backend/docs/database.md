# Database Schema

**Engine**: MySQL 8.4  
**ORM**: Laravel Eloquent  
**Primary Keys**: UUID (`HasUuids` trait) on all main tables

---

## Tables

### `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `name` | varchar | |
| `email` | varchar | unique |
| `password` | varchar | bcrypt hashed |
| `role` | enum | `admin`, `sales`, `customer`, `seo` |
| `email_verified_at` | timestamp | nullable |
| `remember_token` | varchar | nullable |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### `tours`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `title` | varchar | |
| `slug` | varchar | unique, used in URLs |
| `description` | text | |
| `category` | varchar | e.g. `cultural`, `adventure` |
| `region` | varchar | e.g. `north-india`, `rajasthan` |
| `price` | decimal | per person (INR) |
| `duration` | int | days |
| `featured` | boolean | shown on homepage |
| `cover_image` | varchar | image path/URL |
| `is_active` | boolean | soft-hide without deleting |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### `tour_gallery`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint | PK |
| `tour_id` | uuid | FK → tours.id |
| `image_url` | varchar | |
| `caption` | varchar | nullable |
| `position` | int | display order |

---

### `tour_itineraries`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint | PK |
| `tour_id` | uuid | FK → tours.id |
| `day` | int | day number (1, 2, 3...) |
| `title` | varchar | e.g. "Arrival in Delhi" |
| `description` | text | |
| `meals` | json | array: `["breakfast", "dinner"]` |
| `accommodation` | varchar | hotel name, nullable |

---

### `destinations`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint | PK |
| `name` | varchar | |
| `slug` | varchar | unique |
| `region` | varchar | |
| `description` | text | |
| `image_url` | varchar | |
| `is_featured` | boolean | |

---

### `testimonials`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint | PK |
| `name` | varchar | customer name |
| `location` | varchar | city/country |
| `rating` | tinyint | 1–5 |
| `review` | text | |
| `tour_id` | uuid | FK → tours.id, nullable |
| `is_active` | boolean | |
| `created_at` | timestamp | |

---

### `leads`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `name` | varchar | |
| `email` | varchar | |
| `phone` | varchar | nullable |
| `message` | text | |
| `tour_slug` | varchar | nullable, which tour they enquired about |
| `status` | enum | `new`, `contacted`, `qualified`, `converted`, `lost` |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

---

### `lead_notes`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `lead_id` | uuid | FK → leads.id |
| `user_id` | uuid | FK → users.id (who added the note) |
| `note` | text | |
| `created_at` | timestamp | immutable — no updates |

---

## Relationships

```
Tour ──< TourGallery      (hasMany / belongsTo)
Tour ──< TourItinerary    (hasMany / belongsTo)
Tour ──< Testimonial      (hasMany / belongsTo)
Lead ──< LeadNote         (hasMany / belongsTo)
User ──< LeadNote         (hasMany / belongsTo)
```

---

## Migrations Order

1. `create_users_table`
2. `create_tours_table`
3. `create_tour_gallery_table`
4. `create_tour_itineraries_table`
5. `create_destinations_table`
6. `create_testimonials_table`
7. `create_leads_table`
8. `create_lead_notes_table`

---

## Useful Commands

```bash
# Run all migrations
./vendor/bin/sail artisan migrate

# Fresh start with seed data
./vendor/bin/sail artisan migrate:fresh --seed

# Check migration status
./vendor/bin/sail artisan migrate:status

# Open MySQL shell
./vendor/bin/sail mysql
```
