import test, { before, after } from "node:test"
import assert from "node:assert/strict"
import { startDatabase, stopDatabase, resetDatabase } from "../helpers/db.js"
import { createUsers } from "../helpers/factories.js"

/**
 * The login throttle is a deliberate addition — Laravel had none — so it is
 * exercised in its own file, where turning it on cannot bleed into any other
 * test's request count. `skip` is evaluated per request, so setting the flag
 * before the app handles anything is enough.
 */
process.env.TEST_LOGIN_LIMITER = "1"

const { app, request } = await import("../helpers/agent.js")

before(async () => {
  await startDatabase()
  await resetDatabase()
  await createUsers()
})
after(stopDatabase)

const failedLogin = () =>
  request(app)
    .post("/api/auth/login")
    .send({ email: "nobody@trendzytours.com", password: "wrong-password" })

const successfulLogin = () =>
  request(app)
    .post("/api/auth/login")
    .send({ email: "admin@trendzytours.com", password: "admin123" })

test("only failed logins count toward the throttle", async () => {
  // Successes first: if they consumed budget, the 30 failures below would trip
  // early. This is the regression guard for `skipSuccessfulRequests` — without
  // it, an office behind a single NAT address locks itself out by signing in.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await successfulLogin().expect(200)
  }

  for (let attempt = 0; attempt < 30; attempt += 1) {
    await failedLogin().expect(401)
  }

  const response = await failedLogin().expect(429)

  assert.deepEqual(response.body, { message: "Too many login attempts. Please try again later." })
})

test("once the window is exhausted even a valid password is refused", async () => {
  await successfulLogin().expect(429)
})
