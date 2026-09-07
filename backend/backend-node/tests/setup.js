/**
 * Preloaded with `node --import ./tests/setup.js` so these are in place before
 * src/config/env.js runs its fail-fast check at import time.
 *
 * Values are assigned unconditionally: dotenv never overwrites an existing
 * variable, so this also guarantees a developer's real .env — a live Atlas URI,
 * a real Brevo key — can never be reached from the test suite.
 */
process.env.NODE_ENV = "test"
process.env.MONGODB_URI = "mongodb://127.0.0.1:1/unused-tests-connect-explicitly"
process.env.JWT_SECRET = "test-secret-do-not-use-outside-the-test-suite"
process.env.JWT_TTL = "10080"
process.env.FRONTEND_URL = "http://localhost:3000"
process.env.COOKIE_DOMAIN = ""
process.env.COOKIE_SAMESITE = "lax"
process.env.COOKIE_SECURE = "false"
// Pinned to the documented default so a developer's OTP_REQUIRED=false in .env
// cannot silently weaken the suite. tests/integration/otpDisabled.test.js is
// the one file that overrides it.
process.env.OTP_REQUIRED = "true"
process.env.BREVO_API_KEY = ""
process.env.BREVO_LIST_ID = ""
