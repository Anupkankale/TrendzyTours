import { z } from "zod"
import * as m from "../utils/messages.js"

/**
 * Thin builders over zod that reproduce Laravel's rule wording. Messages use a
 * `:attribute` placeholder that validate.js fills in from the issue path, so
 * the `field` argument here is documentation for the reader, not the message.
 */

const typeError = (expected) => (issue) =>
  issue.input === undefined ? m.required() : expected()

export const stringField = () => z.string({ error: typeError(m.mustBeString) })

export const emailField = () => stringField().check(z.email(m.mustBeEmail()))

// Laravel's `integer` rule accepts numeric strings, which is what the
// dashboard's <input type="number"> fields actually submit.
export const integerField = () =>
  z.preprocess(
    (value) => (typeof value === "string" && /^-?\d+$/.test(value.trim()) ? Number(value) : value),
    z.number({ error: typeError(m.mustBeInteger) }).int(m.mustBeInteger()),
  )

export const booleanField = () =>
  z.preprocess(
    (value) => {
      if (value === "true" || value === 1 || value === "1") return true
      if (value === "false" || value === 0 || value === "0") return false
      return value
    },
    z.boolean({ error: typeError(m.mustBeBoolean) }),
  )

export const arrayField = (item) => z.array(item, { error: typeError(m.mustBeArray) })

export const enumField = (values) =>
  z.enum(values, {
    error: (issue) => (issue.input === undefined ? m.required() : m.invalidChoice()),
  })

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const uuidField = () => stringField().regex(UUID_RE, m.mustBeUuid())

const DATE_RE = /^\d{4}-\d{2}-\d{2}/

/** Laravel `date`: accepts "YYYY-MM-DD" (what the frontend's date inputs emit). */
export const dateField = () =>
  stringField()
    .regex(DATE_RE, m.mustBeDate())
    .refine((value) => !Number.isNaN(Date.parse(value)), m.mustBeDate())
    .transform((value) => value.slice(0, 10))

/** Laravel's `required` on a string also rejects "". */
export const requiredString = () => stringField().min(1, m.required())
