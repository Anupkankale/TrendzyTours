import test, { before, after, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { startDatabase, stopDatabase, resetDatabase } from "../helpers/db.js"
import { createTour } from "../helpers/factories.js"
import { app, request } from "../helpers/agent.js"

before(startDatabase)
after(stopDatabase)
beforeEach(resetDatabase)

const slugs = (body) => body.map((tour) => tour.slug).sort()

test("lists only published tours", async () => {
  await createTour({ slug: "live-tour", publishedAt: "2025-01-10" })
  await createTour({ slug: "draft-tour", publishedAt: null })

  const response = await request(app).get("/api/tours").expect(200)

  assert.deepEqual(slugs(response.body), ["live-tour"])
})

test("filters by category, region and featured", async () => {
  await createTour({ slug: "goa", category: "domestic", region: "asia", featured: true })
  await createTour({ slug: "rome", category: "world-travellers", region: "europe", featured: false })

  assert.deepEqual(slugs((await request(app).get("/api/tours?category=domestic").expect(200)).body), ["goa"])
  assert.deepEqual(slugs((await request(app).get("/api/tours?region=europe").expect(200)).body), ["rome"])
  assert.deepEqual(slugs((await request(app).get("/api/tours?featured=true").expect(200)).body), ["goa"])
  assert.deepEqual(slugs((await request(app).get("/api/tours?featured=false").expect(200)).body), ["rome"])
})

test("ignores blank filters, matching Laravel's filled() check", async () => {
  await createTour({ slug: "goa" })
  await createTour({ slug: "rome", category: "cruise" })

  const response = await request(app).get("/api/tours?category=&region=").expect(200)

  assert.equal(response.body.length, 2)
})

test("an unpublished tour is invisible even by direct slug", async () => {
  await createTour({ slug: "draft-tour", publishedAt: null })

  const response = await request(app).get("/api/tours/draft-tour").expect(404)

  assert.deepEqual(response.body, { message: "Not found" })
})

test("returns a single tour with its gallery and itinerary inlined", async () => {
  await createTour({
    slug: "bali-bliss-7-nights",
    name: "Bali Bliss",
    gallery: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
    itinerary: [
      { day: 1, title: "Arrive", description: "Land", meals: ["Dinner"], accommodation: "Hotel" },
      { day: 2, title: "Explore", description: "Tour", meals: ["Breakfast"], accommodation: null },
    ],
  })

  const response = await request(app).get("/api/tours/bali-bliss-7-nights").expect(200)

  assert.equal(response.body.name, "Bali Bliss")
  assert.deepEqual(response.body.gallery, ["https://example.com/a.jpg", "https://example.com/b.jpg"])
  assert.deepEqual(response.body.itinerary.map((day) => day.day), [1, 2])
  assert.equal(response.body.itinerary[0].accommodation, "Hotel")
  assert.equal(response.body.itinerary[1].accommodation, null)
})

test("responses are bare arrays and objects, with no data envelope", async () => {
  await createTour({ slug: "goa" })

  const list = await request(app).get("/api/tours").expect(200)
  const single = await request(app).get("/api/tours/goa").expect(200)

  assert.ok(Array.isArray(list.body))
  assert.ok(!("data" in single.body))
})

test("the health route reports the same payload as Laravel's web.php", async () => {
  const response = await request(app).get("/").expect(200)

  assert.deepEqual(response.body, { service: "Trendzy Tours API", version: "1.0", status: "ok" })
})

test("an unknown route answers 404 JSON, not HTML", async () => {
  const response = await request(app).get("/api/nope").expect(404)

  assert.deepEqual(response.body, { message: "Not found" })
})
