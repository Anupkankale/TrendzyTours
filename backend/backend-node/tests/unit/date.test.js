import test from "node:test"
import assert from "node:assert/strict"
import { toDateString, toIsoString, normalizeDateInput } from "../../src/utils/date.js"

test("toIsoString pads to the six fractional digits Carbon emitted", () => {
  assert.equal(toIsoString(new Date("2026-09-06T06:28:14.233Z")), "2026-09-06T06:28:14.233000Z")
  assert.equal(toIsoString(new Date("2026-09-06T06:28:14.000Z")), "2026-09-06T06:28:14.000000Z")
})

test("toIsoString accepts a date string and returns null for nullish input", () => {
  assert.equal(toIsoString("2026-09-06T06:28:14.000Z"), "2026-09-06T06:28:14.000000Z")
  assert.equal(toIsoString(null), null)
  assert.equal(toIsoString(undefined), null)
})

test("toDateString formats in UTC, matching Laravel's UTC-pinned app timezone", () => {
  // 23:30 UTC is already the next day in IST; the UTC date is what Laravel sent.
  assert.equal(toDateString(new Date("2026-09-06T23:30:00.000Z")), "2026-09-06")
  assert.equal(toDateString(new Date("2026-09-06T00:10:00.000Z")), "2026-09-06")
})

test("toDateString passes stored date strings through untouched", () => {
  assert.equal(toDateString("2025-01-10"), "2025-01-10")
  assert.equal(toDateString(null), null)
})

test("normalizeDateInput reduces any accepted input to YYYY-MM-DD", () => {
  assert.equal(normalizeDateInput("2025-01-10T00:00:00.000Z"), "2025-01-10")
  assert.equal(normalizeDateInput(new Date("2025-01-10T12:00:00Z")), "2025-01-10")
  assert.equal(normalizeDateInput(""), null)
})
