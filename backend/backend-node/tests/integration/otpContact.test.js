import test, { before, after, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { startDatabase, stopDatabase, resetDatabase } from "../helpers/db.js"
import { app, request } from "../helpers/agent.js"
import { OtpVerification } from "../../src/models/OtpVerification.js"
import { Lead } from "../../src/models/Lead.js"

before(startDatabase)
after(stopDatabase)
beforeEach(resetDatabase)

const EMAIL = "visitor@example.com"

/**
 * The delivered code is not in the response, so the tests read it back the
 * same way a mail client would receive it — from the row that was just written.
 */
async function sendOtp(email = EMAIL) {
  await request(app).post("/api/otp/send").send({ email }).expect(200)
  const record = await OtpVerification.findOne({ email }).sort({ createdAt: -1 })
  return record.otp
}

async function verifiedToken(email = EMAIL) {
  const otp = await sendOtp(email)
  const response = await request(app).post("/api/otp/verify").send({ email, otp }).expect(200)
  return response.body.email_token
}

const contactPayload = (emailToken, overrides = {}) => ({
  name: "Vis Itor",
  email: EMAIL,
  phone: "9876543210",
  message: "I want to visit Bali soon",
  tourInterest: "Bali Bliss",
  emailToken,
  ...overrides,
})

test("sending an OTP stores a six-digit code with a ten-minute expiry", async () => {
  const response = await request(app).post("/api/otp/send").send({ email: EMAIL }).expect(200)

  assert.deepEqual(response.body, { message: "OTP sent to your email." })

  const record = await OtpVerification.findOne({ email: EMAIL })
  assert.match(record.otp, /^\d{6}$/)
  assert.equal(record.verifiedAt, null)

  const ttlMs = record.expiresAt.getTime() - record.createdAt.getTime()
  assert.ok(Math.abs(ttlMs - 10 * 60 * 1000) < 1000, `expected ~10 minutes, got ${ttlMs}ms`)
})

test("the email is normalised to lower case", async () => {
  await request(app).post("/api/otp/send").send({ email: "VISITOR@Example.com" }).expect(200)

  assert.equal(await OtpVerification.countDocuments({ email: EMAIL }), 1)
})

test("a fourth OTP within ten minutes is throttled", async () => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await request(app).post("/api/otp/send").send({ email: EMAIL }).expect(200)
  }

  const response = await request(app).post("/api/otp/send").send({ email: EMAIL }).expect(429)

  assert.deepEqual(response.body, {
    message: "Too many OTP requests. Please wait 10 minutes before trying again.",
  })
})

test("the throttle is per email address", async () => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await request(app).post("/api/otp/send").send({ email: EMAIL }).expect(200)
  }

  await request(app).post("/api/otp/send").send({ email: "someone-else@example.com" }).expect(200)
})

test("verifying returns a token under the snake_case key the frontend reads", async () => {
  const otp = await sendOtp()
  const response = await request(app).post("/api/otp/verify").send({ email: EMAIL, otp }).expect(200)

  assert.equal(response.body.message, "Email verified successfully.")
  assert.match(response.body.email_token, /^[0-9a-f-]{36}$/)
})

test("a wrong code is rejected", async () => {
  await sendOtp()
  const response = await request(app)
    .post("/api/otp/verify")
    .send({ email: EMAIL, otp: "000000" })
    .expect(422)

  assert.deepEqual(response.body, { message: "Invalid OTP." })
})

test("an expired code is rejected with its own message", async () => {
  const otp = await sendOtp()
  await OtpVerification.updateOne({ email: EMAIL }, { $set: { expiresAt: new Date(Date.now() - 1000) } })

  const response = await request(app).post("/api/otp/verify").send({ email: EMAIL, otp }).expect(422)

  assert.deepEqual(response.body, { message: "OTP has expired. Please request a new one." })
})

test("a code cannot be verified twice", async () => {
  const otp = await sendOtp()

  await request(app).post("/api/otp/verify").send({ email: EMAIL, otp }).expect(200)
  await request(app).post("/api/otp/verify").send({ email: EMAIL, otp }).expect(422)
})

test("the contact form stores a lead and consumes the token", async () => {
  const token = await verifiedToken()

  const response = await request(app).post("/api/contact").send(contactPayload(token)).expect(200)

  assert.deepEqual(response.body, { success: true })

  const lead = await Lead.findOne({})
  assert.equal(lead.name, "Vis Itor")
  assert.equal(lead.source, "contact-form")
  assert.equal(lead.status, "new")
  assert.equal(lead.tourInterest, "Bali Bliss")
  assert.equal(await OtpVerification.countDocuments({ emailToken: token }), 0, "the token is single-use")
})

test("the token cannot be replayed", async () => {
  const token = await verifiedToken()

  await request(app).post("/api/contact").send(contactPayload(token)).expect(200)
  await request(app).post("/api/contact").send(contactPayload(token)).expect(422)

  assert.equal(await Lead.countDocuments({}), 1)
})

test("an unverified token is refused", async () => {
  const response = await request(app).post("/api/contact").send(contactPayload("bogus")).expect(422)

  assert.equal(
    response.body.message,
    "Email not verified. Please verify your email with the OTP and try again.",
  )
  assert.deepEqual(response.body.errors.emailToken, ["Invalid or expired verification token."])
  assert.equal(await Lead.countDocuments({}), 0)
})

test("the submitted email must be the verified one", async () => {
  const token = await verifiedToken()

  const response = await request(app)
    .post("/api/contact")
    .send(contactPayload(token, { email: "someone-else@example.com" }))
    .expect(422)

  assert.equal(
    response.body.message,
    "Email mismatch. Please verify the same email you entered in the form.",
  )
  assert.equal(await Lead.countDocuments({}), 0)
})

test("the email comparison ignores case", async () => {
  const token = await verifiedToken()

  await request(app)
    .post("/api/contact")
    .send(contactPayload(token, { email: "VISITOR@Example.com" }))
    .expect(200)
})

test("the contact payload is validated", async () => {
  const response = await request(app)
    .post("/api/contact")
    .send({ name: "V", email: "nope", phone: "123", message: "hi", emailToken: "x" })
    .expect(422)

  assert.deepEqual(response.body.errors.name, ["The name field must be at least 2 characters."])
  assert.deepEqual(response.body.errors.email, ["The email field must be a valid email address."])
  assert.deepEqual(response.body.errors.phone, ["The phone field must be at least 10 characters."])
  assert.deepEqual(response.body.errors.message, ["The message field must be at least 10 characters."])
})

test("newsletter signup always reports success", async () => {
  const response = await request(app)
    .post("/api/newsletter")
    .send({ email: "news@example.com" })
    .expect(200)

  assert.deepEqual(response.body, { success: true })
})

test("newsletter signup still validates the address", async () => {
  const response = await request(app).post("/api/newsletter").send({ email: "nope" }).expect(422)

  assert.deepEqual(response.body.errors.email, ["The email field must be a valid email address."])
})
