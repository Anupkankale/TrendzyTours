import test from "node:test"
import assert from "node:assert/strict"
import { zodErrorToApiError } from "../../src/middleware/validate.js"
import { loginSchema } from "../../src/validators/authSchema.js"
import { tourStoreSchema, tourUpdateSchema } from "../../src/validators/tourSchema.js"
import { bookingStoreSchema } from "../../src/validators/bookingSchema.js"
import { humanizeAttribute } from "../../src/utils/messages.js"

/** Runs a schema and returns the 422 body the API would send. */
function body(schema, input) {
  const result = schema.safeParse(input)
  assert.equal(result.success, false, "expected the payload to fail validation")
  const error = zodErrorToApiError(result.error)
  return { message: error.message, errors: error.errors }
}

test("humanizeAttribute matches Laravel's Str::snake() + underscore replacement", () => {
  assert.equal(humanizeAttribute("pricePerPerson"), "price per person")
  assert.equal(humanizeAttribute("seoDescription"), "seo description")
  assert.equal(humanizeAttribute("tourId"), "tour id")
  assert.equal(humanizeAttribute("email"), "email")
})

test("required messages use Laravel's wording", () => {
  const { errors } = body(loginSchema, {})

  assert.deepEqual(errors.email, ["The email field is required."])
  assert.deepEqual(errors.password, ["The password field is required."])
})

test("the message repeats the first error and counts the rest, like Laravel", () => {
  assert.equal(
    body(loginSchema, {}).message,
    "The email field is required. (and 1 more error)",
  )
  // Verified against the running Laravel backend for this exact payload.
  assert.equal(
    body(tourStoreSchema, { name: "x" }).message,
    "The slug field is required. (and 17 more errors)",
  )
})

test("a single failure gets no error-count suffix", () => {
  assert.equal(
    body(loginSchema, { email: "nope", password: "admin123" }).message,
    "The email field must be a valid email address.",
  )
})

test("message text humanises the attribute while the errors key stays camelCase", () => {
  const { errors } = body(tourStoreSchema, { name: "x" })

  assert.deepEqual(errors.pricePerPerson, ["The price per person field is required."])
  assert.deepEqual(errors.seoDescription, ["The seo description field is required."])
})

test("a missing groupSize reports the parent and both children, as Laravel did", () => {
  const { errors } = body(tourStoreSchema, { name: "x" })

  assert.deepEqual(errors.groupSize, ["The group size field is required."])
  assert.deepEqual(errors["groupSize.min"], ["The group size.min field is required."])
  assert.deepEqual(errors["groupSize.max"], ["The group size.max field is required."])
})

test("gte on groupSize.max renders the other field's value, not its name", () => {
  const { errors } = body(tourUpdateSchema, { groupSize: { min: 10, max: 2 } })

  assert.deepEqual(errors["groupSize.max"], [
    "The group size.max field must be greater than or equal to 10.",
  ])
})

test("nested itinerary failures carry the array index", () => {
  const { errors } = body(tourUpdateSchema, {
    itinerary: [{ day: 1, title: "ok", description: "d", meals: [] }, { day: 2, description: "d", meals: [] }],
  })

  assert.deepEqual(errors["itinerary.1.title"], ["The itinerary.1.title field is required."])
})

test("update schemas drop absent keys instead of nulling them", () => {
  const result = tourUpdateSchema.safeParse({ featured: true })

  assert.equal(result.success, true)
  assert.deepEqual(result.data, { featured: true })
})

test("integer fields accept the numeric strings the dashboard submits", () => {
  const result = bookingStoreSchema.safeParse({
    tourId: "b1111111-1111-1111-1111-111111111111",
    customerName: "Test Person",
    customerEmail: "test@example.com",
    customerPhone: "9876543210",
    travelDate: "2030-03-15",
    adults: "2",
    children: "1",
    source: "call",
  })

  assert.equal(result.success, true)
  assert.equal(result.data.adults, 2)
  assert.equal(result.data.children, 1)
})

test("boolean fields accept the string forms Laravel's boolean rule allowed", () => {
  assert.equal(tourUpdateSchema.safeParse({ featured: "true" }).data.featured, true)
  assert.equal(tourUpdateSchema.safeParse({ featured: "0" }).data.featured, false)
})

test("travelDate must be after today", () => {
  const base = {
    tourId: "b1111111-1111-1111-1111-111111111111",
    customerName: "Test Person",
    customerEmail: "test@example.com",
    customerPhone: "9876543210",
    adults: 1,
    source: "call",
  }

  assert.deepEqual(body(bookingStoreSchema, { ...base, travelDate: "2020-01-01" }).errors.travelDate, [
    "The travel date field must be a date after today.",
  ])
})

test("enum fields report Laravel's `in:` wording", () => {
  const { errors } = body(bookingStoreSchema, {
    tourId: "b1111111-1111-1111-1111-111111111111",
    customerName: "Test Person",
    customerEmail: "test@example.com",
    customerPhone: "9876543210",
    travelDate: "2030-03-15",
    adults: 1,
    source: "carrier-pigeon",
  })

  assert.deepEqual(errors.source, ["The selected source is invalid."])
})

test("unknown keys are stripped rather than persisted", () => {
  const result = tourUpdateSchema.safeParse({ featured: true, isAdmin: true })

  assert.equal(result.success, true)
  assert.ok(!("isAdmin" in result.data))
})
