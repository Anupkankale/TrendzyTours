import mongoose from "mongoose"
import { uuidId, jsonTransform } from "./uuid.js"

export const BOOKING_STATUSES = ["pending", "confirmed", "cancelled"]
export const BOOKING_SOURCES = ["website", "call", "reference", "walk-in"]

const bookingSchema = new mongoose.Schema(
  {
    _id: uuidId,
    tourId: { type: String, ref: "Tour", required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    // "YYYY-MM-DD", matching Laravel's travel_date->toDateString() output.
    travelDate: { type: String, required: true },
    adults: { type: Number, default: 1, min: 1 },
    children: { type: Number, default: 0, min: 0 },
    message: { type: String, default: null },
    status: { type: String, enum: BOOKING_STATUSES, default: "pending" },
    source: { type: String, enum: BOOKING_SOURCES, default: "website" },
  },
  { timestamps: true, toJSON: jsonTransform },
)

bookingSchema.index({ createdAt: -1 })
bookingSchema.index({ tourId: 1 })

export const Booking = mongoose.model("Booking", bookingSchema)
