import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import { connectDatabase, disconnectDatabase } from "../../src/config/database.js"

let memoryServer = null

/**
 * Spins up an in-memory MongoDB for the test file. Set MONGODB_TEST_URI to
 * point at a real throwaway server instead (useful in CI images that cannot
 * download the mongod binary).
 */
export async function startDatabase() {
  if (process.env.MONGODB_TEST_URI) {
    await connectDatabase(process.env.MONGODB_TEST_URI)
    return
  }

  memoryServer = await MongoMemoryServer.create()
  await connectDatabase(memoryServer.getUri("trendzytours_test"))
}

export async function stopDatabase() {
  await disconnectDatabase()
  if (memoryServer) await memoryServer.stop()
  memoryServer = null
}

/** Empties every collection between tests without dropping the indexes. */
export async function resetDatabase() {
  const collections = Object.values(mongoose.connection.collections)
  await Promise.all(collections.map((collection) => collection.deleteMany({})))
}
