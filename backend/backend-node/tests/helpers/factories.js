import { randomUUID } from "node:crypto"
import { User } from "../../src/models/User.js"
import { Tour } from "../../src/models/Tour.js"
import { Lead } from "../../src/models/Lead.js"
import { Booking } from "../../src/models/Booking.js"

/**
 * Real hashes produced by PHP's password_hash(…, PASSWORD_BCRYPT, ['cost'=>12]),
 * i.e. byte for byte what Laravel's Hash::make() wrote into MySQL. Using these
 * rather than bcryptjs output is the point: it proves migrated passwords still
 * verify, including the `$2y$` prefix PHP uses and bcryptjs does not emit.
 */
export const LARAVEL_HASHES = {
  admin123: "$2y$12$QnpjZ9buuf.LwlplHl.poOVDJOwRKpwdohNeOhiukbeeSh2ua7nhK",
  sales123: "$2y$12$uuIqsDAKFARm/OXJ2YgB9.btxHF.aurSvr27SOXMFa0EdRNV1Db0C",
}

export const USERS = {
  admin: {
    _id: "11111111-1111-1111-1111-111111111111",
    name: "Admin User",
    email: "admin@trendzytours.com",
    password: LARAVEL_HASHES.admin123,
    role: "admin",
  },
  sales: {
    _id: "22222222-2222-2222-2222-222222222222",
    name: "Sales Manager",
    email: "sales@trendzytours.com",
    password: LARAVEL_HASHES.sales123,
    role: "sales",
  },
  seo: {
    _id: "33333333-3333-3333-3333-333333333333",
    name: "SEO Manager",
    email: "seo@trendzytours.com",
    password: LARAVEL_HASHES.admin123,
    role: "seo",
  },
}

export const createUsers = () => User.insertMany(Object.values(USERS))

let tourCounter = 0

/** A complete, valid tour. Override any field via `overrides`. */
export function tourAttributes(overrides = {}) {
  tourCounter += 1

  return {
    _id: randomUUID(),
    slug: `tour-${tourCounter}`,
    name: `Tour ${tourCounter}`,
    category: "domestic",
    region: "asia",
    destination: "Goa, India",
    duration: 3,
    groupSizeMin: 2,
    groupSizeMax: 10,
    pricePerPerson: 15000,
    heroImage: "https://example.com/hero.jpg",
    gallery: ["https://example.com/hero.jpg"],
    shortDescription: "Short description",
    description: "Long description",
    seoDescription: "SEO description",
    highlights: ["Beach"],
    inclusions: ["Hotel"],
    exclusions: ["Flights"],
    itinerary: [
      { day: 1, title: "Arrive", description: "Land in Goa", meals: ["Dinner"], accommodation: null },
    ],
    featured: false,
    publishedAt: "2025-01-10",
    ...overrides,
  }
}

export const createTour = (overrides = {}) => Tour.create(tourAttributes(overrides))

/** The camelCase payload the dashboard's TourForm submits. */
export function tourPayload(overrides = {}) {
  const { _id, groupSizeMin, groupSizeMax, ...rest } = tourAttributes()

  return {
    ...rest,
    groupSize: { min: groupSizeMin, max: groupSizeMax },
    ...overrides,
  }
}

export const createLead = (overrides = {}) =>
  Lead.create({
    name: "Walk In",
    email: "walkin@example.com",
    phone: "9876500000",
    tourInterest: null,
    message: "Interested",
    source: "manual",
    status: "new",
    ...overrides,
  })

export const createBooking = (tourId, overrides = {}) =>
  Booking.create({
    tourId,
    customerName: "Priya Sharma",
    customerEmail: "priya@example.com",
    customerPhone: "9823001234",
    travelDate: "2030-03-15",
    adults: 2,
    children: 0,
    message: null,
    status: "pending",
    source: "website",
    ...overrides,
  })
