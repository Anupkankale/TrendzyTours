import test, { before, after, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { startDatabase, stopDatabase, resetDatabase } from "../helpers/db.js"
import { createUsers, createTour, createBooking, tourPayload } from "../helpers/factories.js"
import { loginAs } from "../helpers/agent.js"
import { Tour } from "../../src/models/Tour.js"

before(startDatabase)
after(stopDatabase)
beforeEach(async () => {
  await resetDatabase()
  await createUsers()
})

test("lists drafts as well as published tours, newest-updated first", async () => {
  const older = await createTour({ slug: "older" })
  const newer = await createTour({ slug: "newer", publishedAt: null })

  await Tour.updateOne({ _id: older._id }, { $set: { updatedAt: new Date("2026-01-01") } }, { timestamps: false })
  await Tour.updateOne({ _id: newer._id }, { $set: { updatedAt: new Date("2026-06-01") } }, { timestamps: false })

  const admin = await loginAs("admin")
  const response = await admin.get("/api/admin/tours").expect(200)

  assert.deepEqual(response.body.map((tour) => tour.slug), ["newer", "older"])
})

test("creates a tour, answering 201 like Laravel's JsonResource", async () => {
  const admin = await loginAs("admin")
  const payload = tourPayload({
    slug: "new-tour",
    gallery: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
    itinerary: [
      { day: 1, title: "Arrive", description: "Land", meals: ["Dinner"], accommodation: "Hotel" },
      { day: 2, title: "Leave", description: "Fly", meals: [], accommodation: null },
    ],
  })

  const response = await admin.post("/api/admin/tours").send(payload).expect(201)

  assert.equal(response.body.slug, "new-tour")
  assert.deepEqual(response.body.groupSize, { min: 2, max: 10 })
  assert.equal(response.body.gallery.length, 2)
  assert.equal(response.body.itinerary.length, 2)

  const stored = await Tour.findById(response.body.id)
  assert.equal(stored.groupSizeMin, 2)
  assert.equal(stored.itinerary[1].accommodation, null)
})

test("refuses a duplicate slug with Laravel's unique message", async () => {
  await createTour({ slug: "taken" })
  const admin = await loginAs("admin")

  const response = await admin.post("/api/admin/tours").send(tourPayload({ slug: "taken" })).expect(422)

  assert.equal(response.body.message, "The slug has already been taken.")
  assert.deepEqual(response.body.errors.slug, ["The slug has already been taken."])
})

test("a partial update leaves untouched fields alone", async () => {
  const tour = await createTour({ slug: "keep-me", name: "Original", publishedAt: null })
  const admin = await loginAs("admin")

  const response = await admin
    .put(`/api/admin/tours/${tour._id}`)
    .send({ publishedAt: "2026-01-01" })
    .expect(200)

  assert.equal(response.body.name, "Original")
  assert.equal(response.body.publishedAt, "2026-01-01")
  assert.equal(response.body.itinerary.length, 1)
  assert.equal(response.body.gallery.length, 1)
})

test("publishing a draft makes it visible on the public endpoint", async () => {
  const tour = await createTour({ slug: "draft", publishedAt: null })
  const admin = await loginAs("admin")

  await admin.get("/api/tours/draft").expect(404)
  await admin.put(`/api/admin/tours/${tour._id}`).send({ publishedAt: "2026-01-01" }).expect(200)
  await admin.get("/api/tours/draft").expect(200)
})

test("replacing the itinerary swaps it wholesale, as syncItinerary did", async () => {
  const tour = await createTour({ slug: "resync" })
  const admin = await loginAs("admin")

  const response = await admin
    .put(`/api/admin/tours/${tour._id}`)
    .send({
      itinerary: [{ day: 1, title: "Only day", description: "d", meals: ["Lunch"], accommodation: null }],
      gallery: ["https://example.com/only.jpg"],
    })
    .expect(200)

  assert.deepEqual(response.body.itinerary.map((day) => day.title), ["Only day"])
  assert.deepEqual(response.body.gallery, ["https://example.com/only.jpg"])
})

test("a tour may keep its own slug on update", async () => {
  const tour = await createTour({ slug: "mine" })
  const admin = await loginAs("admin")

  await admin.put(`/api/admin/tours/${tour._id}`).send({ slug: "mine" }).expect(200)
})

test("a tour may not take another tour's slug", async () => {
  await createTour({ slug: "theirs" })
  const tour = await createTour({ slug: "mine" })
  const admin = await loginAs("admin")

  await admin.put(`/api/admin/tours/${tour._id}`).send({ slug: "theirs" }).expect(422)
})

test("deletes a tour that has no bookings", async () => {
  const tour = await createTour({ slug: "disposable" })
  const admin = await loginAs("admin")

  const response = await admin.delete(`/api/admin/tours/${tour._id}`).expect(200)

  assert.deepEqual(response.body, { ok: true })
  assert.equal(await Tour.countDocuments({}), 0)
})

test("refuses to delete a tour that has bookings", async () => {
  const tour = await createTour({ slug: "booked" })
  await createBooking(tour._id)
  const admin = await loginAs("admin")

  const response = await admin.delete(`/api/admin/tours/${tour._id}`).expect(422)

  assert.deepEqual(response.body, {
    message: "This tour has existing bookings and cannot be deleted.",
  })
  assert.equal(await Tour.countDocuments({}), 1)
})

test("unknown ids are 404 on read, update and delete", async () => {
  const admin = await loginAs("admin")
  const missing = "deadbeef-0000-0000-0000-000000000000"

  await admin.get(`/api/admin/tours/${missing}`).expect(404)
  await admin.put(`/api/admin/tours/${missing}`).send({ featured: true }).expect(404)
  await admin.delete(`/api/admin/tours/${missing}`).expect(404)
})
