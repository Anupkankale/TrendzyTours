import jwt from "jsonwebtoken"
import { env } from "../config/env.js"
import { User } from "../models/User.js"
import { unauthorized } from "../utils/ApiError.js"

/**
 * Port of App\Http\Middleware\ParseJwtFromCookie: fall back to the httpOnly
 * `auth_token` cookie when no Authorization header is present.
 */
export function tokenFromRequest(req) {
  const header = req.headers.authorization
  if (header?.startsWith("Bearer ")) return header.slice(7)
  return req.cookies?.[env.cookie.name] ?? null
}

/** Equivalent of Laravel's `auth:api` guard. Populates `req.user`. */
export async function authenticate(req, _res, next) {
  const token = tokenFromRequest(req)
  if (!token) return next(unauthorized())

  let payload
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] })
  } catch {
    return next(unauthorized())
  }

  // The DB is authoritative: a deleted or role-changed user must not keep
  // acting on a still-valid token, which is how the Eloquent guard behaved.
  const user = await User.findById(payload.sub)
  if (!user) return next(unauthorized())

  req.user = user
  next()
}
