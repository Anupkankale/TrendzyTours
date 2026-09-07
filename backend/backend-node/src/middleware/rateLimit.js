import rateLimit from "express-rate-limit"
import { env } from "../config/env.js"

/**
 * Brute-force protection on login — a deliberate addition; Laravel had no
 * throttle here. Only *failed* attempts count, so a busy office behind one NAT
 * IP is never locked out by ordinary use, and the limit is high enough that
 * the parity harness does not trip it either.
 */
export const loginLimiter = rateLimit({
  // The suite makes many failed logins on purpose, so the throttle is off by
  // default under NODE_ENV=test and switched on only by its own test file.
  skip: () => env.nodeEnv === "test" && process.env.TEST_LOGIN_LIMITER !== "1",
  windowMs: 15 * 60 * 1000,
  limit: 30,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
})

/**
 * The contact and newsletter endpoints are public, unauthenticated, and each
 * accepted request writes a row and fires an email. The email OTP used to be
 * the de-facto gate; with that removed, this is what stands between the form
 * and a bot. The limit is high enough that a person retrying a failed
 * submission never notices it.
 */
export const contactLimiter = rateLimit({
  // Off under test unless a test opts in, the same arrangement loginLimiter uses.
  skip: () => env.nodeEnv === "test" && process.env.TEST_CONTACT_LIMITER !== "1",
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many submissions. Please try again later." },
})
