import { createApp } from "./src/app.js"
import { env } from "./src/config/env.js"
import { connectDatabase, disconnectDatabase } from "./src/config/database.js"

async function main() {
  await connectDatabase()

  const server = createApp().listen(env.port, () => {
    console.log(`[api] Trendzy Tours API listening on :${env.port} (${env.nodeEnv})`)
  })

  const shutdown = async (signal) => {
    console.log(`[api] ${signal} received, shutting down`)
    server.close(async () => {
      await disconnectDatabase()
      process.exit(0)
    })
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"))
  process.on("SIGINT", () => shutdown("SIGINT"))
}

main().catch((error) => {
  console.error("[api] failed to start:", error)
  process.exit(1)
})
