import test, { before, after } from "node:test"
import assert from "node:assert/strict"
import { startDatabase, stopDatabase, resetDatabase } from "../helpers/db.js"
import { Lead } from "../../src/models/Lead.js"

/**
 * With the email OTP removed, this throttle is the only thing standing between
 * the public contact form and a bot, so it gets its own file — turning it on
 * here cannot bleed into another test's request count. `skip` is evaluated per
 * request, so setting the flag before the app handles anything is enough.
 */
process.env.TEST_CONTACT_LIMITER = "1"

const { app, request } = await import("../helpers/agent.js")

before(async () => {
  await startDatabase()
  await resetDatabase()
})
after(stopDatabase)

const submit = (n) =>
  request(app).post("/api/contact").send({
    name: "Par Ity",
    email: `visitor${n}@example.com`,
    phone: "9876543210",
    message: "I would like details on the September departure.",
  })

test("the contact form accepts ten submissions an hour, then answers 429", async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await submit(attempt).expect(200)
  }

  const response = await submit(99).expect(429)

  assert.deepEqual(response.body, { message: "Too many submissions. Please try again later." })
  // The refused request must not reach the database.
  assert.equal(await Lead.countDocuments(), 10)
})

test("the newsletter endpoint shares the same budget", async () => {
  await request(app).post("/api/newsletter").send({ email: "reader@example.com" }).expect(429)
})
