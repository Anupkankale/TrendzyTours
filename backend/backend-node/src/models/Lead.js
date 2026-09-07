import mongoose from "mongoose"
import { uuidId, jsonTransform } from "./uuid.js"

export const LEAD_STATUSES = ["new", "contacted", "in-progress", "won", "lost"]
export const LEAD_SOURCES = ["contact-form", "manual"]

/** `lead_notes` embedded. Laravel's LeadNote has `created_at` only. */
const leadNoteSchema = new mongoose.Schema(
  {
    _id: uuidId,
    content: { type: String, required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

const leadSchema = new mongoose.Schema(
  {
    _id: uuidId,
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    tourInterest: { type: String, default: null },
    message: { type: String, required: true },
    status: { type: String, enum: LEAD_STATUSES, default: "new" },
    source: { type: String, enum: LEAD_SOURCES, default: "contact-form" },
    notes: { type: [leadNoteSchema], default: [] },
  },
  { timestamps: true, toJSON: jsonTransform },
)

leadSchema.index({ createdAt: -1 })

export const Lead = mongoose.model("Lead", leadSchema)
