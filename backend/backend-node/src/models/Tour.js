import mongoose from "mongoose"
import { uuidId, jsonTransform } from "./uuid.js"

export const TOUR_CATEGORIES = ["domestic", "world-travellers", "cruise", "ladies-only"]

/**
 * `tour_itineraries` and `tour_gallery` were separate MySQL tables joined by
 * FK. On MongoDB they are embedded in the parent document: ordering is the
 * array order, and deleting a tour drops them for free.
 */
const itinerarySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, min: 1 },
    title: { type: String, required: true },
    description: { type: String, required: true },
    meals: { type: [String], default: [] },
    accommodation: { type: String, default: null },
  },
  { _id: false },
)

const tourSchema = new mongoose.Schema(
  {
    _id: uuidId,
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true },
    category: { type: String, enum: TOUR_CATEGORIES, required: true },
    region: { type: String, required: true },
    destination: { type: String, required: true },
    duration: { type: Number, required: true, min: 1 },
    groupSizeMin: { type: Number, required: true, min: 1 },
    groupSizeMax: { type: Number, required: true, min: 1 },
    pricePerPerson: { type: Number, required: true, min: 0 },
    heroImage: { type: String, required: true },
    gallery: { type: [String], default: [] },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    seoDescription: { type: String, required: true },
    highlights: { type: [String], default: [] },
    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },
    itinerary: { type: [itinerarySchema], default: [] },
    featured: { type: Boolean, default: false },
    // Stored as a plain "YYYY-MM-DD" string, exactly like the MySQL `date`
    // column serialized by Laravel — no timezone can shift it.
    publishedAt: { type: String, default: null },
  },
  { timestamps: true, toJSON: jsonTransform },
)

tourSchema.index({ category: 1 })
tourSchema.index({ region: 1 })
tourSchema.index({ featured: 1 })

export const Tour = mongoose.model("Tour", tourSchema)
