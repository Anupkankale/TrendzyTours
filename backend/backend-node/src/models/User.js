import mongoose from "mongoose"
import { uuidId, jsonTransform } from "./uuid.js"

export const ROLES = ["admin", "sales", "customer", "seo"]

const userSchema = new mongoose.Schema(
  {
    _id: uuidId,
    name: { type: String, required: true },
    // MySQL's default collation made email lookups case-insensitive; lowercasing
    // on write + read reproduces that behaviour on MongoDB.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "customer" },
  },
  { timestamps: true, toJSON: jsonTransform },
)

export const User = mongoose.model("User", userSchema)
