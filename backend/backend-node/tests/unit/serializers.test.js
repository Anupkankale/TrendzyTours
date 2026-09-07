import test from "node:test"
import assert from "node:assert/strict"
import { serializeTour } from "../../src/serializers/tourSerializer.js"
import { serializeBooking } from "../../src/serializers/bookingSerializer.js"
import { serializeLead } from "../../src/serializers/leadSerializer.js"
import { serializeUser } from "../../src/serializers/userSerializer.js"

const tourDoc = {
  _id: "b1111111-1111-1111-1111-111111111111",
  slug: "bali-bliss-7-nights",
  name: "Bali Bliss",
  category: "world-travellers",
  region: "asia",
  destination: "Bali, Indonesia",
  duration: "7",
  groupSizeMin: "2",
  groupSizeMax: "20",
  pricePerPerson: "65000",
  heroImage: "https://example.com/hero.jpg",
  gallery: ["https://example.com/hero.jpg"],
  shortDescription: "Short",
  description: "Long",
  seoDescription: "SEO",
  highlights: ["Ubud rice terraces"],
  inclusions: ["Guide"],
  exclusions: ["Visa fees"],
  itinerary: [{ day: "1", title: "Arrive", description: "Land", meals: undefined }],
  featured: 1,
  publishedAt: "2025-01-10",
  updatedAt: new Date("2026-09-06T06:28:14.000Z"),
}

test("serializeTour produces exactly the frontend's Tour shape", () => {
  const result = serializeTour(tourDoc)

  // Exactly the fields declared by types/tour.ts — no more, no fewer.
  assert.deepEqual(Object.keys(result).sort(), [
    "category", "description", "destination", "duration", "exclusions",
    "featured", "gallery", "groupSize", "heroImage", "highlights", "id",
    "inclusions", "itinerary", "name", "pricePerPerson", "publishedAt",
    "region", "seoDescription", "shortDescription", "slug", "updatedAt",
  ])
})

test("serializeTour nests groupSize and casts numeric and boolean fields", () => {
  const result = serializeTour(tourDoc)

  assert.deepEqual(result.groupSize, { min: 2, max: 20 })
  assert.equal(result.duration, 7)
  assert.equal(result.pricePerPerson, 65000)
  assert.equal(result.featured, true)
  assert.equal(result.itinerary[0].day, 1)
  assert.ok(!("groupSizeMin" in result), "the flat column names must not leak")
})

test("serializeTour renders updatedAt as a date, not a timestamp", () => {
  // Laravel used optional($this->updated_at)->toDateString().
  assert.equal(serializeTour(tourDoc).updatedAt, "2026-09-06")
  assert.equal(serializeTour({ ...tourDoc, updatedAt: null }).updatedAt, null)
})

test("serializeTour defaults missing itinerary meals and accommodation", () => {
  const day = serializeTour(tourDoc).itinerary[0]

  assert.deepEqual(day.meals, [])
  assert.equal(day.accommodation, null)
})

const bookingDoc = {
  _id: "aaaaaaaa-0000-0000-0000-000000000001",
  customerName: "Priya Sharma",
  customerEmail: "priya@example.com",
  customerPhone: "9823001234",
  travelDate: "2030-03-15",
  adults: 2,
  children: 0,
  message: null,
  status: "pending",
  source: "website",
  createdAt: new Date("2026-09-06T06:28:14.000Z"),
  updatedAt: new Date("2026-09-06T06:28:14.000Z"),
}

test("serializeBooking reads the tour name and slug from the populated tour", () => {
  const result = serializeBooking({
    ...bookingDoc,
    tourId: { _id: "b1111111-1111-1111-1111-111111111111", name: "Bali Bliss", slug: "bali-bliss-7-nights" },
  })

  assert.equal(result.tourId, "b1111111-1111-1111-1111-111111111111")
  assert.equal(result.tourName, "Bali Bliss")
  assert.equal(result.tourSlug, "bali-bliss-7-nights")
  assert.equal(result.createdAt, "2026-09-06T06:28:14.000000Z")
})

test("serializeBooking falls back to em-dash and empty slug when the tour is gone", () => {
  const result = serializeBooking({ ...bookingDoc, tourId: "b1111111-1111-1111-1111-111111111111" })

  assert.equal(result.tourId, "b1111111-1111-1111-1111-111111111111")
  assert.equal(result.tourName, "—")
  assert.equal(result.tourSlug, "")
})

test("serializeLead orders embedded notes oldest first", () => {
  const result = serializeLead({
    _id: "lead-1",
    name: "Walk In",
    email: "walkin@example.com",
    phone: "9876500000",
    tourInterest: undefined,
    message: "Interested",
    status: "new",
    source: "manual",
    createdAt: new Date("2026-09-06T06:00:00.000Z"),
    updatedAt: new Date("2026-09-06T06:30:00.000Z"),
    notes: [
      { _id: "n2", content: "Second", authorName: "A", authorEmail: "a@b.co", createdAt: new Date("2026-09-06T06:20:00.000Z") },
      { _id: "n1", content: "First", authorName: "A", authorEmail: "a@b.co", createdAt: new Date("2026-09-06T06:10:00.000Z") },
    ],
  })

  assert.deepEqual(result.notes.map((note) => note.content), ["First", "Second"])
  assert.deepEqual(Object.keys(result.notes[0]).sort(), ["authorEmail", "authorName", "content", "createdAt", "id"])
  assert.equal(result.tourInterest, null)
})

test("serializeUser never exposes the password", () => {
  const result = serializeUser({
    _id: "11111111-1111-1111-1111-111111111111",
    email: "admin@trendzytours.com",
    name: "Admin User",
    role: "admin",
    password: "$2y$12$secret",
  })

  assert.deepEqual(result, {
    id: "11111111-1111-1111-1111-111111111111",
    email: "admin@trendzytours.com",
    name: "Admin User",
    role: "admin",
  })
})
