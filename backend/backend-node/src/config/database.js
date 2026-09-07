import mongoose from "mongoose"
import { env } from "./env.js"

mongoose.set("strictQuery", true)

export async function connectDatabase(uri = env.mongoUri) {
  mongoose.connection.on("connected", () => {
    console.log(`[db] connected to ${mongoose.connection.name}`)
  })
  mongoose.connection.on("error", (err) => {
    console.error("[db] connection error:", err.message)
  })
  mongoose.connection.on("disconnected", () => {
    console.warn("[db] disconnected")
  })

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    // Atlas free tier caps connections; keep the pool modest.
    maxPoolSize: 10,
  })

  return mongoose.connection
}

export async function disconnectDatabase() {
  await mongoose.connection.close()
}
