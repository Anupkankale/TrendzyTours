import "dotenv/config"

/**
 * Central env access. Every other module imports from here rather than reading
 * process.env directly, so a missing variable fails loudly at boot instead of
 * surfacing as a confusing runtime error deep inside a request.
 */

const REQUIRED = ["MONGODB_URI", "JWT_SECRET"]

const missing = REQUIRED.filter((key) => !process.env[key])
if (missing.length) {
  console.error(
    `[env] Missing required environment variable(s): ${missing.join(", ")}\n` +
      `      Copy .env.example to .env and fill them in.`,
  )
  process.exit(1)
}

const bool = (value, fallback = false) => {
  if (value === undefined || value === "") return fallback
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase())
}

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "development") === "production",

  mongoUri: process.env.MONGODB_URI,

  jwtSecret: process.env.JWT_SECRET,
  // Laravel's JWT_TTL is expressed in minutes; keep the same unit.
  jwtTtlMinutes: Number(process.env.JWT_TTL || 10080),

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  // FRONTEND_URL accepts a comma-separated list so local :3000/:3001 and the
  // production origin can be allowed at once.
  frontendOrigins: (process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  cookie: {
    name: "auth_token",
    domain: process.env.COOKIE_DOMAIN || undefined,
    sameSite: process.env.COOKIE_SAMESITE || "lax",
    secure: bool(process.env.COOKIE_SECURE, false),
  },

  // Email verification on the contact form. Defaults to on: turning it off is
  // an explicit choice, never something a missing variable does silently.
  otpRequired: bool(process.env.OTP_REQUIRED, true),

  brevo: {
    apiKey: process.env.BREVO_API_KEY || "",
    listId: process.env.BREVO_LIST_ID || "",
    senderEmail: process.env.BREVO_SENDER_EMAIL || "noreply@trendzytours.com",
    notifyEmail: process.env.BREVO_NOTIFY_EMAIL || "support@trendzytours.com",
  },

  mysql: {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    database: process.env.MYSQL_DATABASE || "trendzy_tours",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
  },
}
