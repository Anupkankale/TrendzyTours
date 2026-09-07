import test, { before, after, beforeEach } from "node:test"
import assert from "node:assert/strict"
import jwt from "jsonwebtoken"
import { startDatabase, stopDatabase, resetDatabase } from "../helpers/db.js"
import { createUsers, USERS } from "../helpers/factories.js"
import { app, request, loginAs } from "../helpers/agent.js"
import { env } from "../../src/config/env.js"

before(startDatabase)
after(stopDatabase)
beforeEach(async () => {
  await resetDatabase()
  await createUsers()
})

test("logs in against a password hash written by PHP's bcrypt", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@trendzytours.com", password: "admin123" })
    .expect(200)

  assert.deepEqual(response.body, {
    user: {
      id: USERS.admin._id,
      email: "admin@trendzytours.com",
      name: "Admin User",
      role: "admin",
    },
  })
})

test("email matching is case-insensitive, as it was under MySQL's collation", async () => {
  await request(app)
    .post("/api/auth/login")
    .send({ email: "ADMIN@TrendzyTours.com", password: "admin123" })
    .expect(200)
})

test("sets the JWT as an httpOnly cookie", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@trendzytours.com", password: "admin123" })
    .expect(200)

  const cookie = response.headers["set-cookie"].find((value) => value.startsWith("auth_token="))

  assert.ok(cookie, "auth_token cookie must be set")
  assert.match(cookie, /HttpOnly/i)
  assert.match(cookie, /SameSite=Lax/i)
  assert.ok(!response.body.token, "the token must not also be returned in the body")
})

test("the token carries the claims types/auth.ts declares", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: "sales@trendzytours.com", password: "sales123" })
    .expect(200)

  const cookie = response.headers["set-cookie"].find((value) => value.startsWith("auth_token="))
  const payload = jwt.verify(cookie.split("auth_token=")[1].split(";")[0], env.jwtSecret)

  assert.equal(payload.sub, USERS.sales._id)
  assert.equal(payload.email, "sales@trendzytours.com")
  assert.equal(payload.name, "Sales Manager")
  assert.equal(payload.role, "sales")
  assert.ok(payload.exp > payload.iat)
})

test("rejects a wrong password with Laravel's exact message", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@trendzytours.com", password: "wrong-password" })
    .expect(401)

  assert.deepEqual(response.body, { message: "Invalid email or password" })
})

test("rejects an unknown email with the same message, not a 404", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: "nobody@trendzytours.com", password: "admin123" })
    .expect(401)

  assert.deepEqual(response.body, { message: "Invalid email or password" })
})

test("validates the login payload", async () => {
  const response = await request(app).post("/api/auth/login").send({}).expect(422)

  assert.equal(response.body.message, "The email field is required. (and 1 more error)")
  assert.deepEqual(response.body.errors.password, ["The password field is required."])
})

test("/api/auth/me answers from the cookie", async () => {
  const agent = await loginAs("admin")
  const response = await agent.get("/api/auth/me").expect(200)

  assert.equal(response.body.user.role, "admin")
})

test("/api/auth/me also accepts a bearer token", async () => {
  const token = jwt.sign(
    { sub: USERS.admin._id, email: USERS.admin.email, name: USERS.admin.name, role: "admin" },
    env.jwtSecret,
    { algorithm: "HS256", expiresIn: 3600 },
  )

  await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`).expect(200)
})

test("accepts a token shaped by tymon/jwt-auth, so sessions survive the cutover", async () => {
  const now = Math.floor(Date.now() / 1000)
  const token = jwt.sign(
    {
      sub: USERS.admin._id,
      iat: now,
      nbf: now,
      exp: now + 3600,
      jti: "laravel-generated-id",
      prv: "23bd5c8949f600adb39e701c400872db7a5976f7",
      email: USERS.admin.email,
      name: USERS.admin.name,
      role: "admin",
    },
    env.jwtSecret,
    { algorithm: "HS256" },
  )

  const response = await request(app)
    .get("/api/auth/me")
    .set("Authorization", `Bearer ${token}`)
    .expect(200)

  assert.equal(response.body.user.id, USERS.admin._id)
})

test("rejects missing, tampered and expired tokens", async () => {
  const expired = jwt.sign({ sub: USERS.admin._id }, env.jwtSecret, { expiresIn: -10 })
  const foreign = jwt.sign({ sub: USERS.admin._id }, "a-different-secret", { expiresIn: 3600 })

  for (const header of [null, "Bearer not-a-token", `Bearer ${expired}`, `Bearer ${foreign}`]) {
    const pending = request(app).get("/api/auth/me")
    if (header) pending.set("Authorization", header)

    const response = await pending.expect(401)
    assert.deepEqual(response.body, { message: "Unauthenticated." })
  }
})

test("a token for a deleted user stops working immediately", async () => {
  const agent = await loginAs("admin")
  await agent.get("/api/auth/me").expect(200)

  const { User } = await import("../../src/models/User.js")
  await User.deleteOne({ _id: USERS.admin._id })

  await agent.get("/api/auth/me").expect(401)
})

test("logout clears the cookie and ends the session", async () => {
  const agent = await loginAs("admin")
  const response = await agent.post("/api/auth/logout").expect(200)

  assert.deepEqual(response.body, { success: true })
  await agent.get("/api/auth/me").expect(401)
})
