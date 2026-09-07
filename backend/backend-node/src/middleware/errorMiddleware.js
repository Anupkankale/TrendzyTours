import { env } from "../config/env.js"
import { ApiError } from "../utils/ApiError.js"
import { notUnique } from "../utils/messages.js"

export function notFoundHandler(_req, res) {
  res.status(404).json({ message: "Not found" })
}

// eslint-disable-next-line no-unused-vars -- Express identifies handlers by arity.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    const body = { message: err.message }
    if (err.errors) body.errors = err.errors
    return res.status(err.status).json(body)
  }

  // Duplicate key -> the 422 Laravel produced for a `unique:` rule.
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? "field"
    return res.status(422).json({
      message: notUnique(field),
      errors: { [field]: [notUnique(field)] },
    })
  }

  if (err?.name === "ValidationError" && err.errors) {
    const errors = {}
    for (const [field, detail] of Object.entries(err.errors)) {
      errors[field] = [detail.message]
    }
    const first = Object.values(errors)[0]?.[0] ?? "The given data was invalid."
    return res.status(422).json({ message: first, errors })
  }

  if (err?.name === "CastError") {
    return res.status(404).json({ message: "Not found" })
  }

  console.error("[error]", err)

  res.status(500).json({
    message: "Server Error",
    ...(env.isProduction ? {} : { detail: err?.message }),
  })
}
