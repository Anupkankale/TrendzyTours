import mongoose from "mongoose"

const otpVerificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true },
    emailToken: { type: String },
    expiresAt: { type: Date, required: true },
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

// A verified token has to outlive `expiresAt` — the contact form is submitted
// after the 10-minute OTP window — so the TTL hangs off createdAt instead, at
// 24h. (Laravel never purged these rows at all.)
otpVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 })

// Unique only over documents that actually carry a token; `sparse` would not be
// enough because it does not skip explicit nulls.
otpVerificationSchema.index(
  { emailToken: 1 },
  { unique: true, partialFilterExpression: { emailToken: { $type: "string" } } },
)

export const OtpVerification = mongoose.model("OtpVerification", otpVerificationSchema)
