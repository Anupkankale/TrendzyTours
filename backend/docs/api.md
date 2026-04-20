# API Reference

Base URL: `http://localhost:8888` (local) / `https://api.trendzytours.com` (production)

All responses are JSON. No `data` wrapper — resources are returned as plain objects/arrays.

---

## OTP Phone Verification

Phone verification is required before submitting the contact form. Use these endpoints to verify a phone number before lead submission.

### `POST /api/otp/send`

Generates a 6-digit OTP and sends it via SMS (MSG91).

**Rate limit:** 3 requests per phone per 10 minutes.

**Request Body**
```json
{ "phone": "9876543210" }
```

**Response** `200 OK`
```json
{ "message": "OTP sent successfully." }
```

**Response** `429 Too Many Requests` — rate limit exceeded

---

### `POST /api/otp/verify`

Verifies the OTP and returns a `phone_token` valid for 30 minutes.

**Request Body**
```json
{ "phone": "9876543210", "otp": "482910" }
```

**Response** `200 OK`
```json
{
  "message": "Phone verified successfully.",
  "phone_token": "uuid-string"
}
```

**Response** `422 Unprocessable Entity` — invalid or expired OTP

> Pass `phone_token` in the `/api/contact` request body to prove phone ownership.

---

## Public Endpoints

### Tours

#### `GET /api/tours`

Returns all active tours. Supports query filters:

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `category` | string | `adventure` | Filter by tour category |
| `region` | string | `rajasthan` | Filter by destination region |
| `featured` | boolean | `true` | Only featured tours |

**Response** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Golden Triangle Tour",
    "slug": "golden-triangle-tour",
    "description": "...",
    "category": "cultural",
    "region": "north-india",
    "price": 25000,
    "duration": 7,
    "featured": true,
    "coverImage": "...",
    "gallery": [...],
    "itinerary": [...]
  }
]
```

---

#### `GET /api/tours/{slug}`

Returns a single tour by slug.

**Response** `200 OK` — tour object (same shape as above)
**Response** `404 Not Found` — if slug does not exist

---

### Contact

#### `POST /api/contact`

Submits a contact/enquiry form. Saves a lead and sends a notification email via Brevo.

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "phoneToken": "uuid-from-otp-verify",
  "message": "I'm interested in the Rajasthan tour",
  "tourInterest": "Royal Rajasthan Tour"
}
```

> `phoneToken` is required — obtain it by verifying the phone via `POST /api/otp/verify` first.

**Response** `201 Created`
```json
{ "message": "Enquiry submitted successfully" }
```

---

### Newsletter

#### `POST /api/newsletter`

Subscribes an email to the Brevo newsletter list.

**Request Body**
```json
{ "email": "subscriber@example.com" }
```

**Response** `200 OK`
```json
{ "message": "Subscribed successfully" }
```

---

## Authentication

### `POST /api/auth/login`

Authenticates a user. Sets an httpOnly `auth_token` cookie on success.

**Request Body**
```json
{
  "email": "admin@trendzytours.com",
  "password": "password"
}
```

**Response** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@trendzytours.com",
    "role": "admin"
  }
}
```

**Response** `401 Unauthorized` — invalid credentials

---

### `POST /api/auth/logout`

Invalidates the JWT and clears the `auth_token` cookie.

**Response** `200 OK`
```json
{ "message": "Logged out successfully" }
```

---

### `GET /api/auth/me`

Returns the currently authenticated user.

**Headers**: Requires valid `auth_token` cookie

**Response** `200 OK`
```json
{
  "id": "uuid",
  "name": "Admin User",
  "email": "admin@trendzytours.com",
  "role": "admin"
}
```

**Response** `401 Unauthorized` — missing or expired token

---

## Protected Endpoints (admin & sales only)

All routes below require a valid `auth_token` cookie and `role` of `admin` or `sales`.

### Leads

#### `GET /api/leads`

Returns all customer leads/enquiries.

**Response** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "message": "...",
    "tourSlug": "golden-triangle-tour",
    "status": "new",
    "notes": [],
    "createdAt": "2025-01-15T10:30:00Z"
  }
]
```

---

#### `POST /api/leads`

Creates a new lead manually.

**Request Body** — same fields as contact form

---

#### `GET /api/leads/{id}`

Returns a single lead with all notes.

---

#### `PUT /api/leads/{id}`

Updates lead status or appends a follow-up note.

**Request Body**
```json
{
  "status": "contacted",
  "note": "Called the customer, interested in May trip"
}
```

Status values: `new`, `contacted`, `qualified`, `converted`, `lost`

---

## Error Responses

| Status | Meaning |
|--------|---------|
| `400` | Validation error — body contains `errors` object |
| `401` | Unauthenticated |
| `403` | Insufficient role |
| `404` | Resource not found |
| `500` | Server error |
