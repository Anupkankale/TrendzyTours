/**
 * Port of database/seeders/*.php — `npm run seed`.
 *
 * Clear-then-insert, so it is safe to re-run. Refuses to touch a production
 * database unless --force is passed.
 */
import bcrypt from "bcryptjs"
import { env } from "../src/config/env.js"
import { connectDatabase, disconnectDatabase } from "../src/config/database.js"
import { User } from "../src/models/User.js"
import { Tour } from "../src/models/Tour.js"
import { Lead } from "../src/models/Lead.js"
import { Booking } from "../src/models/Booking.js"
import { Destination } from "../src/models/Destination.js"
import { Testimonial } from "../src/models/Testimonial.js"
import { users } from "./data/users.js"
import { tours } from "./data/tours.js"
import { destinations } from "./data/destinations.js"
import { testimonials } from "./data/testimonials.js"
import { bookingCustomers, bookingStatuses } from "./data/bookingCustomers.js"

const force = process.argv.includes("--force")

// Laravel's Hash::make() default.
const BCRYPT_ROUNDS = 12

function isoDatePlusDays(days) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * BookingSeeder used rand(); this uses a fixed sequence instead so re-seeding
 * is reproducible and the parity harness can diff booking payloads.
 */
function buildBookings(tourDocs) {
  const travelOffsets = [21, 35, 48, 62, 75, 89, 103, 117]
  const adultCounts = [2, 1, 4, 3, 2, 1, 3, 2]
  const childCounts = [0, 1, 2, 0, 1, 0, 2, 1]

  return bookingCustomers.map((customer, index) => ({
    tourId: tourDocs[index % tourDocs.length]._id,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    travelDate: isoDatePlusDays(travelOffsets[index]),
    adults: adultCounts[index],
    children: childCounts[index],
    message:
      index % 3 === 0 ? "Looking forward to the trip! Please confirm availability." : null,
    status: bookingStatuses[index % bookingStatuses.length],
    source: "website",
  }))
}

async function seed() {
  if (env.isProduction && !force) {
    console.error("[seed] NODE_ENV=production — refusing to wipe data. Re-run with --force.")
    process.exit(1)
  }

  await connectDatabase()

  console.log("[seed] clearing collections")
  await Promise.all([
    User.deleteMany({}),
    Tour.deleteMany({}),
    Lead.deleteMany({}),
    Booking.deleteMany({}),
    Destination.deleteMany({}),
    Testimonial.deleteMany({}),
  ])

  const hashedUsers = await Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, BCRYPT_ROUNDS),
    })),
  )
  await User.insertMany(hashedUsers)
  console.log(`[seed] users: ${hashedUsers.length}`)

  // insertMany preserves array order, which the API's createdAt+_id sort relies on.
  const tourDocs = await Tour.insertMany(tours)
  console.log(`[seed] tours: ${tourDocs.length}`)

  await Destination.insertMany(destinations)
  console.log(`[seed] destinations: ${destinations.length}`)

  await Testimonial.insertMany(testimonials)
  console.log(`[seed] testimonials: ${testimonials.length}`)

  const bookings = buildBookings(tourDocs)
  await Booking.insertMany(bookings)
  console.log(`[seed] bookings: ${bookings.length}`)

  console.log("\n[seed] done. Login with:")
  for (const user of users) {
    console.log(`  ${user.role.padEnd(8)} ${user.email} / ${user.password}`)
  }

  await disconnectDatabase()
}

seed().catch(async (error) => {
  console.error("[seed] failed:", error)
  await disconnectDatabase().catch(() => {})
  process.exit(1)
})
