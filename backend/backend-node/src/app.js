import express from "express"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import { env } from "./config/env.js"
import apiRoutes from "./routes/index.js"
import { notFoundHandler, errorHandler } from "./middleware/errorMiddleware.js"

export function createApp() {
  const app = express()

  // Hostinger terminates TLS in front of the app; without this the `secure`
  // cookie flag and req.ip would both be wrong.
  app.set("trust proxy", 1)
  app.disable("x-powered-by")

  app.use(
    helmet({
      // JSON API: no HTML to protect, and the default CORP would block
      // cross-origin reads from the frontend.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  )

  app.use(
    cors({
      origin: env.frontendOrigins,
      credentials: true,
    }),
  )

  app.use(express.json({ limit: "1mb" }))
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())

  // Same payload as backend/routes/web.php.
  app.get("/", (_req, res) => {
    res.json({ service: "Trendzy Tours API", version: "1.0", status: "ok" })
  })

  // Laravel's health endpoint.
  app.get("/up", (_req, res) => res.json({ status: "ok" }))

  app.use("/api", apiRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
