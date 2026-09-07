import test, { before, after, beforeEach } from "node:test"
import assert from "node:assert/strict"

/**
 * OTP_REQUIRED=false, in its own file so the flag cannot leak into the suite
 * that covers the default, verified-email behaviour.
 *
 * Everything that reaches src/ is imported dynamically *below* the assignment:
 * static imports are hoisted and would evaluate src/config/env.js — which
 * reads this variable once — before the line ever ran.
 */
process.env.OTP_REQUIRED = "false"

const { startDatabase, stopDatabase, resetDatabase } = await import("../helpers/db.js")
const { app, request } = await import("../helpers/agent.js")
const { OtpVerification } = await import("../../src/models/OtpVerification.js")
const { Lead } = await import("../../src/models/Lead.js")

before(startDatabase)
after(stopDatabase)
beforeEach(resetDatabase)

const EMAIL = "visitor@example.com"

const payload = (overrides = {}) => ({
  name: "Vis Itor",
  email: EMAIL,
  phone: "9876543210",
  message: "I want to visit Bali soon",
  tourInterest: "Bali Bliss",
  ...overrides,
})

test("a submission with no emailToken at all is accepted", async () => {
  const response = await request(app).post("/api/contact").send(payload()).expect(200)

  assert.deepEqual(response.body, { success: true })

  const lead = await Lead.findOne({})
  assert.equal(lead.name, "Vis Itor")
  assert.equal(lead.source, "contact-form", "leads still record where they came from")
  assert.equal(lead.status, "new")
})

test("an unrecognised token no longer blocks the submission", async () => {
  await request(app).post("/api/contact").send(payload({ emailToken: "bogus" })).expect(200)

  assert.equal(await Lead.countDocuments({}), 1)
})

test("a mismatched email no longer blocks the submission", async () => {
  await request(app).post("/api/otp/send").send({ email: "someone-else@example.com" }).expect(200)
  const record = await OtpVerification.findOne({ email: "someone-else@example.com" })
  const { body } = await request(app)
    .post("/api/otp/verify")
    .send({ email: "someone-else@example.com", otp: record.otp })
    .expect(200)

  await request(app).post("/api/contact").send(payload({ emailToken: body.email_token })).expect(200)

  assert.equal(await Lead.countDocuments({}), 1)
})

test("the OTP endpoints still work, so the frontend flow is unaffected", async () => {
  await request(app).post("/api/otp/send").send({ email: EMAIL }).expect(200)
  const record = await OtpVerification.findOne({ email: EMAIL })

  const response = await request(app)
    .post("/api/otp/verify")
    .send({ email: EMAIL, otp: record.otp })
    .expect(200)

  assert.match(response.body.email_token, /^[0-9a-f-]{36}$/)
})

test("a genuine token is still consumed, so it cannot be replayed", async () => {
  await request(app).post("/api/otp/send").send({ email: EMAIL }).expect(200)
  const record = await OtpVerification.findOne({ email: EMAIL })
  const { body } = await request(app)
    .post("/api/otp/verify")
    .send({ email: EMAIL, otp: record.otp })
    .expect(200)

  await request(app).post("/api/contact").send(payload({ emailToken: body.email_token })).expect(200)

  assert.equal(await OtpVerification.countDocuments({ emailToken: body.email_token }), 0)
})

test("the rest of the contact payload is still validated", async () => {
  const response = await request(app)
    .post("/api/contact")
    .send({ name: "V", email: "nope", phone: "123", message: "hi" })
    .expect(422)

  assert.deepEqual(response.body.errors.name, ["The name field must be at least 2 characters."])
  assert.deepEqual(response.body.errors.email, ["The email field must be a valid email address."])
  assert.deepEqual(response.body.errors.message, ["The message field must be at least 10 characters."])
  assert.ok(!response.body.errors.emailToken, "emailToken must no longer be demanded")
})
