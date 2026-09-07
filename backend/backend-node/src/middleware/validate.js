import { ApiError } from "../utils/ApiError.js"
import { humanizeAttribute } from "../utils/messages.js"

/**
 * Turns a zod failure into Laravel's 422 body:
 *   { message: <first error> [+ " (and N more errors)"],
 *     errors:  { "field.path": ["msg", ...] } }
 *
 * `useContactForm.ts` reads `err.data.message`, so `message` is load-bearing.
 * Keys stay camelCase (what the frontend sends); only the text is humanised,
 * matching Laravel's `:attribute` substitution.
 */
export function zodErrorToApiError(error) {
  const errors = {}
  let total = 0

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_"
    const attribute = issue.path.map((part) => humanizeAttribute(String(part))).join(".")

    if (!errors[key]) errors[key] = []
    errors[key].push(issue.message.replace(":attribute", attribute))
    total += 1
  }

  const firstKey = Object.keys(errors)[0]
  let message = firstKey ? errors[firstKey][0] : "The given data was invalid."

  // Laravel appends this when a request fails more than one check.
  if (total > 1) {
    const others = total - 1
    message += ` (and ${others} more error${others === 1 ? "" : "s"})`
  }

  return new ApiError(422, message, errors)
}

/** validate(schema) -> middleware; parsed output lands on `req.validated`. */
export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source] ?? {})

    if (!result.success) return next(zodErrorToApiError(result.error))

    req.validated = result.data
    next()
  }
}
