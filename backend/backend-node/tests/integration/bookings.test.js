import test, { before, after, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { startDatabase, stopDatabase, resetDatabase } from "../helpers/db.js"
import { createUsers, createTour, createBooking } from "../helpers/factories.js"
import { loginAs } from "../helpers/agent.js"
import { Booking } from "../../src/models/Booking.js"

before(startDatabase)
after(stopDatabase)
beforeEach(async () => {
  await resetDatabase()
  await createUsers()
})

const validBooking = (tourId, overrides = {}) => ({
  tourId,
  customerName: "Test Person",
  customerEmail: "test@example.com",
  customerPhone: "9876543210",
  travelDate: "2030-03-15",
  adults: 2,
  source: "call",
  ...overrides,
})

test("lists bookings newest first with the tour name and slug resolved", async () => {
  const tour = await createTour({ slug: "bali-bliss", name: "Bali Bliss" })
  await createBooking(tour._id, { customerName: "Older" })
  await createBooking(tour._id, { customerName: "Newer" })

  const bookings = await Booking.find().sort({ customerName: 1 })
  await Booking.updateOne({ _id: bookings[1]._id }, { $set: { createdAt: new Date("2026-01-01") } }, { timestamps: false })
  await Booking.updateOne({ _id: bookings[0]._id }, { $set: { createdAt: new Date("2026-06-01") } }, { timestamps: false })

  const sales = await loginAs("sales")
  const response = await sales.get("/api/bookings").expect(200)

  assert.deepEqual(response.body.map((booking) => booking.customerName), ["Newer", "Older"])
  assert.equal(response.body[0].tourName, "Bali Bliss")
  assert.equal(response.body[0].tourSlug, "bali-bliss")
})

test("creates a booking and answers 201", async () => {
  const tour = await createTour({ name: "Bali Bliss", slug: "bali-bliss" })
  const sales = await loginAs("sales")

  const response = await sales.post("/api/bookings").send(validBooking(tour._id)).expect(201)

  assert.equal(response.body.tourName, "Bali Bliss")
  assert.equal(response.body.children, 0, "children defaults to 0")
  assert.equal(response.body.status, "pending", "status defaults to pending")
  assert.equal(response.body.message, null)
  assert.equal(response.body.travelDate, "2030-03-15")
})

test("accepts the numeric strings the dashboard form submits", async () => {
  const tour = await createTour()
  const sales = await loginAs("sales")

  const response = await sales
    .post("/api/bookings")
    .send(validBooking(tour._id, { adults: "3", children: "2" }))
    .expect(201)

  assert.equal(response.body.adults, 3)
  assert.equal(response.body.children, 2)
})

test("rejects a tour that does not exist", async () => {
  const sales = await loginAs("sales")

  const response = await sales
    .post("/api/bookings")
    .send(validBooking("deadbeef-0000-0000-0000-000000000000"))
    .expect(422)

  assert.equal(response.body.message, "The selected tour id is invalid.")
  assert.equal(await Booking.countDocuments({}), 0)
})

test("rejects a travel date that is not in the future", async () => {
  const tour = await createTour()
  const sales = await loginAs("sales")

  const response = await sales
    .post("/api/bookings")
    .send(validBooking(tour._id, { travelDate: "2020-01-01" }))
    .expect(422)

  assert.deepEqual(response.body.errors.travelDate, [
    "The travel date field must be a date after today.",
  ])
})

test("only manual sources may be booked through the dashboard", async () => {
  const tour = await createTour()
  const sales = await loginAs("sales")

  const response = await sales
    .post("/api/bookings")
    .send(validBooking(tour._id, { source: "website" }))
    .expect(422)

  assert.deepEqual(response.body.errors.source, ["The selected source is invalid."])
})

test("updates the status", async () => {
  const tour = await createTour({ name: "Bali Bliss", slug: "bali-bliss" })
  const booking = await createBooking(tour._id)
  const sales = await loginAs("sales")

  const response = await sales
    .put(`/api/bookings/${booking._id}`)
    .send({ status: "confirmed" })
    .expect(200)

  assert.equal(response.body.status, "confirmed")
  assert.equal(response.body.tourName, "Bali Bliss", "the tour stays populated after an update")
})

test("rejects an unknown status", async () => {
  const tour = await createTour()
  const booking = await createBooking(tour._id)
  const sales = await loginAs("sales")

  const response = await sales.put(`/api/bookings/${booking._id}`).send({ status: "maybe" }).expect(422)

  assert.deepEqual(response.body.errors.status, ["The selected status is invalid."])
})

test("a booking whose tour was removed still serialises", async () => {
  const tour = await createTour()
  const booking = await createBooking(tour._id)
  const { Tour } = await import("../../src/models/Tour.js")
  await Tour.deleteOne({ _id: tour._id })

  const sales = await loginAs("sales")
  const response = await sales.get(`/api/bookings/${booking._id}`).expect(200)

  assert.equal(response.body.tourName, "—")
  assert.equal(response.body.tourSlug, "")
})

test("unknown booking ids are 404", async () => {
  const sales = await loginAs("sales")
  const missing = "deadbeef-0000-0000-0000-000000000000"

  await sales.get(`/api/bookings/${missing}`).expect(404)
  await sales.put(`/api/bookings/${missing}`).send({ status: "confirmed" }).expect(404)
})
