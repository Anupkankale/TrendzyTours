import mongoose from "mongoose"
import { jsonTransform } from "./uuid.js"

/** Seeded for parity with the Laravel backend; no route exposes it today. */
const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    countryCount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    featuredCountries: { type: [String], default: [] },
  },
  { timestamps: true, toJSON: jsonTransform },
)

export const Destination = mongoose.model("Destination", destinationSchema)
