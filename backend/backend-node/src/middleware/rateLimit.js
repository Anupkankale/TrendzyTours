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
