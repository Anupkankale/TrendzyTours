import test, { before, after, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { startDatabase, stopDatabase, resetDatabase } from "../helpers/db.js"
import { request, app } from "../helpers/agent.js"
import { Lead } from "../../src/models/Lead.js"

before(startDatabase)
after(stopDatabase)
beforeEach(resetDatabase)

const VALID = {
  name: "Par Ity",
  email: "visitor@example.com",
  phone: "9876543210",
  tourInterest: "Bali Bliss",
  message: "I would like details on the September departure.",
}

test("accepts a submission with no email verification and records a lead", async () => {
  const response = await request(app).post("/api/contact").send(VALID).expect(200)

  assert.deepEqual(response.body, { success: true })

  const leads = await Lead.find()
  assert.equal(leads.length, 1)
  assert.equal(leads[0].name, "Par Ity")
  assert.equal(leads[0].email, "visitor@example.com")
  assert.equal(leads[0].tourInterest, "Bali Bliss")
  assert.equal(leads[0].source, "contact-form")
  assert.equal(leads[0].status, "new")
})

test("an emailToken left over from the old OTP flow is ignored, not rejected", async () => {
  await request(app)
    .post("/api/contact")
    .send({ ...VALID, emailToken: "stale-token-from-a-cached-frontend" })
    .expect(200)

  const leads = await Lead.find()
  assert.equal(leads.length, 1)
  // The field is stripped rather than persisted.
  assert.equal(leads[0].emailToken, undefined)
})

test("tourInterest is optional and stored as null when absent", async () => {
  const { tourInterest, ...withoutInterest } = VALID
  await request(app).post("/api/contact").send(withoutInterest).expect(200)

  const lead = await Lead.findOne()
  assert.equal(lead.tourInterest, null)
})

test("an empty body reports every required field, and no longer emailToken", async () => {
  const response = await request(app).post("/api/contact").send({}).expect(422)

  assert.deepEqual(
    Object.keys(response.body.errors).sort(),
    ["email", "message", "name", "phone"],
  )
  assert.equal("emailToken" in response.body.errors, false)
})

test("field rules still apply", async () => {
  const response = await request(app)
    .post("/api/contact")
    .send({ ...VALID, email: "not-an-email", phone: "123", message: "short" })
    .expect(422)

  assert.ok(response.body.errors.email)
  assert.ok(response.body.errors.phone)
  assert.ok(response.body.errors.message)
})

test("no lead is written when validation fails", async () => {
  await request(app).post("/api/contact").send({}).expect(422)
  assert.equal(await Lead.countDocuments(), 0)
})

test("the removed OTP endpoints are gone", async () => {
  await request(app).post("/api/otp/send").send({ email: VALID.email }).expect(404)
  await request(app).post("/api/otp/verify").send({ email: VALID.email, otp: "123456" }).expect(404)
})

test("newsletter still accepts a valid address and rejects a bad one", async () => {
  await request(app).post("/api/newsletter").send({ email: "reader@example.com" }).expect(200)
  await request(app).post("/api/newsletter").send({ email: "nope" }).expect(422)
})
