import test, { before, after, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { startDatabase, stopDatabase, resetDatabase } from "../helpers/db.js"
import { createUsers } from "../helpers/factories.js"
import { app, request, loginAs } from "../helpers/agent.js"

before(startDatabase)
after(stopDatabase)
beforeEach(async () => {
  await resetDatabase()
  await createUsers()
})

/** Mirrors the `role:` middleware groups in routes/api.php. */
const MATRIX = [
  { path: "/api/leads", admin: 200, sales: 200, seo: 403 },
  { path: "/api/bookings", admin: 200, sales: 200, seo: 403 },
  { path: "/api/admin/tours", admin: 200, sales: 403, seo: 403 },
]

for (const { path, ...expected } of MATRIX) {
  for (const role of ["admin", "sales", "seo"]) {
    test(`${role} gets ${expected[role]} on GET ${path}`, async () => {
      const agent = await loginAs(role)
      const response = await agent.get(path)

      assert.equal(response.status, expected[role])
      if (expected[role] === 403) assert.deepEqual(response.body, { message: "Forbidden" })
    })
  }
}

test("every guarded route is 401 without a session", async () => {
  for (const path of ["/api/auth/me", "/api/leads", "/api/bookings", "/api/admin/tours"]) {
    const response = await request(app).get(path).expect(401)
    assert.deepEqual(response.body, { message: "Unauthenticated." })
  }
})

test("write routes are guarded too, not just the reads", async () => {
  const sales = await loginAs("sales")

  await sales.post("/api/admin/tours").send({}).expect(403)
  await sales.delete("/api/admin/tours/some-id").expect(403)
})
