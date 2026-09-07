import jwt from "jsonwebtoken"
import { env } from "../config/env.js"

/**
 * Same claim set as User::getJWTCustomClaims() plus the standard `sub`, so the
 * frontend's `JWTPayload` type (types/auth.ts) still describes the token and a
 * token minted by the Laravel backend stays valid here (shared JWT_SECRET).
 */
export function issueToken(user) {
  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    env.jwtSecret,
    { algorithm: "HS256", expiresIn: env.jwtTtlMinutes * 60 },
  )
}

function cookieOptions() {
  return {
    httpOnly: true,
    path: "/",
    domain: env.cookie.domain,
    sameSite: env.cookie.sameSite,
    secure: env.cookie.secure,
  }
}

export function setAuthCookie(res, token) {
  res.cookie(env.cookie.name, token, {
    ...cookieOptions(),
    maxAge: env.jwtTtlMinutes * 60 * 1000,
  })
}

/** Attributes must match setAuthCookie exactly or the browser keeps the cookie. */
export function clearAuthCookie(res) {
  res.clearCookie(env.cookie.name, cookieOptions())
}
