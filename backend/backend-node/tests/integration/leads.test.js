import test, { before, after, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { startDatabase, stopDatabase, resetDatabase } from "../helpers/db.js"
import { createUsers, createLead } from "../helpers/factories.js"
import { loginAs } from "../helpers/agent.js"
import { Lead } from "../../src/models/Lead.js"

before(startDatabase)
after(stopDatabase)
beforeEach(async () => {
  await resetDatabase()
  await createUsers()
})

test("lists leads newest first", async () => {
  const older = await createLead({ name: "Older" })
  const newer = await createLead({ name: "Newer" })

  await Lead.updateOne({ _id: older._id }, { $set: { createdAt: new Date("2026-01-01") } }, { timestamps: false })
  await Lead.updateOne({ _id: newer._id }, { $set: { createdAt: new Date("2026-06-01") } }, { timestamps: false })

  const sales = await loginAs("sales")
  const response = await sales.get("/api/leads").expect(200)

  assert.deepEqual(response.body.map((lead) => lead.name), ["Newer", "Older"])
})

test("creates a manual lead and answers 201", async () => {
  const sales = await loginAs("sales")

  const response = await sales
    .post("/api/leads")
    .send({
      name: "Walk In",
      email: "walkin@example.com",
      phone: "9876500000",
      message: "Wants Dubai",
      tourInterest: "Dubai Extravaganza",
    })
    .expect(201)

  assert.equal(response.body.source, "manual")
  assert.equal(response.body.status, "new")
  assert.equal(response.body.tourInterest, "Dubai Extravaganza")
  assert.deepEqual(response.body.notes, [])
})

test("source and status cannot be set by the client", async () => {
  const sales = await loginAs("sales")

  const response = await sales
    .post("/api/leads")
    .send({
      name: "Walk In",
      email: "walkin@example.com",
      phone: "9876500000",
      message: "Wants Dubai",
      source: "contact-form",
      status: "won",
    })
    .expect(201)

  assert.equal(response.body.source, "manual")
  assert.equal(response.body.status, "new")
})

test("updates the status on its own", async () => {
  const lead = await createLead()
  const sales = await loginAs("sales")

  const response = await sales.put(`/api/leads/${lead._id}`).send({ status: "won" }).expect(200)

  assert.equal(response.body.status, "won")
  assert.deepEqual(response.body.notes, [])
})

test("appends a note attributed to the signed-in user", async () => {
  const lead = await createLead()
  const sales = await loginAs("sales")

  const response = await sales
    .put(`/api/leads/${lead._id}`)
    .send({ note: "Called, will decide Friday" })
    .expect(200)

  assert.equal(response.body.notes.length, 1)
  assert.equal(response.body.notes[0].content, "Called, will decide Friday")
  assert.equal(response.body.notes[0].authorName, "Sales Manager")
  assert.equal(response.body.notes[0].authorEmail, "sales@trendzytours.com")
  assert.ok(response.body.notes[0].id, "each note carries its own id")
})

test("notes accumulate in order, across different authors", async () => {
  const lead = await createLead()
  const sales = await loginAs("sales")
  const admin = await loginAs("admin")

  await sales.put(`/api/leads/${lead._id}`).send({ note: "First", status: "contacted" }).expect(200)
  const response = await admin.put(`/api/leads/${lead._id}`).send({ note: "Second" }).expect(200)

  assert.deepEqual(response.body.notes.map((note) => note.content), ["First", "Second"])
  assert.deepEqual(response.body.notes.map((note) => note.authorName), ["Sales Manager", "Admin User"])
  assert.equal(response.body.status, "contacted", "the earlier status change must survive")
})

test("an update with neither status nor note is a 400", async () => {
  const lead = await createLead()
  const sales = await loginAs("sales")

  const response = await sales.put(`/api/leads/${lead._id}`).send({}).expect(400)

  assert.deepEqual(response.body, { message: "Nothing to update" })
})

test("rejects an unknown status", async () => {
  const lead = await createLead()
  const sales = await loginAs("sales")

  const response = await sales.put(`/api/leads/${lead._id}`).send({ status: "maybe" }).expect(422)

  assert.deepEqual(response.body.errors.status, ["The selected status is invalid."])
})

test("validates the create payload", async () => {
  const sales = await loginAs("sales")
  const response = await sales.post("/api/leads").send({ name: "A" }).expect(422)

  assert.deepEqual(response.body.errors.name, ["The name field must be at least 2 characters."])
  assert.deepEqual(response.body.errors.email, ["The email field is required."])
})

test("unknown lead ids are 404", async () => {
  const sales = await loginAs("sales")
  const missing = "deadbeef-0000-0000-0000-000000000000"

  await sales.get(`/api/leads/${missing}`).expect(404)
  await sales.put(`/api/leads/${missing}`).send({ status: "won" }).expect(404)
})
