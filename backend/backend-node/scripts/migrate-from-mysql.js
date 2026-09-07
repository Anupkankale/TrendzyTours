/**
 * One-off MySQL -> MongoDB Atlas import for the Laravel cutover.
 *
 *   npm run migrate -- --dry-run    # read + report, write nothing
 *   npm run migrate                 # upsert by _id (safe to re-run)
 *
 * UUIDs, timestamps and statuses are preserved, so existing links, sessions
 * and dashboard state survive the switch. `otp_verifications` is deliberately
 * skipped: those rows expire within ten minutes.
 */
import mysql from "mysql2/promise"
import { env } from "../src/config/env.js"
import { connectDatabase, disconnectDatabase } from "../src/config/database.js"
import { User } from "../src/models/User.js"
import { Tour } from "../src/models/Tour.js"
import { Lead } from "../src/models/Lead.js"
import { Booking } from "../src/models/Booking.js"
import { Destination } from "../src/models/Destination.js"
import { Testimonial } from "../src/models/Testimonial.js"

const dryRun = process.argv.includes("--dry-run")

/** JSON columns arrive parsed on some MySQL versions and as text on others. */
function parseJsonColumn(value, fallback = []) {
  if (value === null || value === undefined) return fallback
  if (Array.isArray(value) || typeof value === "object") return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

const dateOnly = (value) => (value ? String(value).slice(0, 10) : null)

async function readMysql() {
  const connection = await mysql.createConnection({
    host: env.mysql.host,
    port: env.mysql.port,
    database: env.mysql.database,
    user: env.mysql.user,
    password: env.mysql.password,
    // config/app.php pins the Laravel app to UTC (the APP_TIMEZONE line in
    // .env was never applied), so stored DATETIMEs are UTC wall-clock and must
    // be read back as such. Override with MYSQL_TIMEZONE if that ever changes.
    timezone: process.env.MYSQL_TIMEZONE || "Z",
    dateStrings: ["DATE"],
  })

  const q = async (sql) => (await connection.query(sql))[0]

  const data = {
    users: await q("SELECT * FROM users"),
    tours: await q("SELECT * FROM tours"),
    gallery: await q("SELECT * FROM tour_gallery ORDER BY tour_id, position"),
    itineraries: await q("SELECT * FROM tour_itineraries ORDER BY tour_id, day"),
    destinations: await q("SELECT * FROM destinations"),
    testimonials: await q("SELECT * FROM testimonials"),
    leads: await q("SELECT * FROM leads"),
    leadNotes: await q("SELECT * FROM lead_notes ORDER BY lead_id, created_at"),
    bookings: await q("SELECT * FROM bookings"),
  }

  await connection.end()
  return data
}

function transformUsers(rows) {
  return rows.map((row) => ({
    _id: row.id,
    name: row.name,
    email: String(row.email).toLowerCase(),
    // Already a bcrypt hash — bcryptjs verifies Laravel's $2y$ prefix as-is.
    password: row.password,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

function transformTours(rows, galleryRows, itineraryRows) {
  const galleryByTour = new Map()
  for (const row of galleryRows) {
    if (!galleryByTour.has(row.tour_id)) galleryByTour.set(row.tour_id, [])
    galleryByTour.get(row.tour_id).push(row.image_url)
  }

  const itineraryByTour = new Map()
  for (const row of itineraryRows) {
    if (!itineraryByTour.has(row.tour_id)) itineraryByTour.set(row.tour_id, [])
    itineraryByTour.get(row.tour_id).push({
      day: Number(row.day),
      title: row.title,
      description: row.description,
      meals: parseJsonColumn(row.meals),
      accommodation: row.accommodation ?? null,
    })
  }

  return rows.map((row) => ({
    _id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    region: row.region,
    destination: row.destination,
    duration: Number(row.duration),
    groupSizeMin: Number(row.group_size_min),
    groupSizeMax: Number(row.group_size_max),
    pricePerPerson: Number(row.price_per_person),
    heroImage: row.hero_image,
    gallery: galleryByTour.get(row.id) ?? [],
    shortDescription: row.short_description,
    description: row.description,
    seoDescription: row.seo_description,
    highlights: parseJsonColumn(row.highlights),
    inclusions: parseJsonColumn(row.inclusions),
    exclusions: parseJsonColumn(row.exclusions),
    itinerary: itineraryByTour.get(row.id) ?? [],
    featured: Boolean(row.featured),
    publishedAt: dateOnly(row.published_at),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

function transformLeads(rows, noteRows) {
  const notesByLead = new Map()
  for (const row of noteRows) {
    if (!notesByLead.has(row.lead_id)) notesByLead.set(row.lead_id, [])
    notesByLead.get(row.lead_id).push({
      _id: row.id,
      content: row.content,
      authorName: row.author_name,
      authorEmail: row.author_email,
      createdAt: row.created_at,
    })
  }

  return rows.map((row) => ({
    _id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    tourInterest: row.tour_interest ?? null,
    message: row.message,
    status: row.status,
    source: row.source,
    notes: notesByLead.get(row.id) ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

function transformBookings(rows) {
  return rows.map((row) => ({
    _id: row.id,
    tourId: row.tour_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    travelDate: dateOnly(row.travel_date),
    adults: Number(row.adults),
    children: Number(row.children),
    message: row.message ?? null,
    status: row.status,
    source: row.source ?? "website",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

const transformDestinations = (rows) =>
  rows.map((row) => ({
    name: row.name,
    slug: row.slug,
    image: row.image,
    countryCount: Number(row.country_count),
    description: row.description,
    featuredCountries: parseJsonColumn(row.featured_countries),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

const transformTestimonials = (rows) =>
  rows.map((row) => ({
    name: row.name,
    city: row.city,
    tourName: row.tour_name,
    rating: Number(row.rating),
    quote: row.quote,
    avatarInitials: row.avatar_initials,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

/** Upsert by _id so a re-run converges instead of duplicating. */
async function upsertById(Model, docs, label) {
  if (!docs.length) {
    console.log(`  ${label.padEnd(13)} 0`)
    return
  }

  const operations = docs.map((doc) => ({
    replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true },
  }))

  // timestamps:false keeps the migrated created_at/updated_at values.
  const result = await Model.bulkWrite(operations, { timestamps: false })
  console.log(
    `  ${label.padEnd(13)} ${docs.length} (inserted ${result.upsertedCount}, replaced ${result.modifiedCount})`,
  )
}

/** Reference data has no stable key in MySQL — replace it wholesale. */
async function replaceAll(Model, docs, label) {
  await Model.deleteMany({})
  if (docs.length) await Model.insertMany(docs, { timestamps: false })
  console.log(`  ${label.padEnd(13)} ${docs.length} (replaced)`)
}

async function migrate() {
  console.log(`[migrate] reading mysql://${env.mysql.host}:${env.mysql.port}/${env.mysql.database}`)
  const raw = await readMysql()

  const payload = {
    users: transformUsers(raw.users),
    tours: transformTours(raw.tours, raw.gallery, raw.itineraries),
    leads: transformLeads(raw.leads, raw.leadNotes),
    bookings: transformBookings(raw.bookings),
    destinations: transformDestinations(raw.destinations),
    testimonials: transformTestimonials(raw.testimonials),
  }

  console.log("[migrate] source counts:")
  for (const [name, rows] of Object.entries(payload)) {
    console.log(`  ${name.padEnd(13)} ${rows.length}`)
  }
  console.log(
    `  ${"(embedded)".padEnd(13)} gallery ${raw.gallery.length}, itinerary days ${raw.itineraries.length}, lead notes ${raw.leadNotes.length}`,
  )

  if (dryRun) {
    console.log("\n[migrate] --dry-run: nothing written.")
    return
  }

  await connectDatabase()

  console.log("\n[migrate] writing to MongoDB:")
  await upsertById(User, payload.users, "users")
  await upsertById(Tour, payload.tours, "tours")
  await upsertById(Lead, payload.leads, "leads")
  await upsertById(Booking, payload.bookings, "bookings")
  await replaceAll(Destination, payload.destinations, "destinations")
  await replaceAll(Testimonial, payload.testimonials, "testimonials")

  console.log("\n[migrate] done.")
  await disconnectDatabase()
}

migrate().catch(async (error) => {
  console.error("[migrate] failed:", error)
  await disconnectDatabase().catch(() => {})
  process.exit(1)
})
