import mongoose from "mongoose"
import { jsonTransform } from "./uuid.js"

/** Seeded for parity with the Laravel backend; no route exposes it today. */
const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    tourName: { type: String, required: true },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    quote: { type: String, required: true },
    avatarInitials: { type: String, required: true, maxlength: 5 },
  },
  { timestamps: true, toJSON: jsonTransform },
)

export const Testimonial = mongoose.model("Testimonial", testimonialSchema)
