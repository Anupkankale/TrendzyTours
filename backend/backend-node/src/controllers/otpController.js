import { randomInt, randomUUID } from "node:crypto"
import { OtpVerification } from "../models/OtpVerification.js"
import { sendOtpEmail } from "../services/brevoService.js"
import { ApiError, tooManyRequests, unprocessable } from "../utils/ApiError.js"

const OTP_TTL_MINUTES = 10
const MAX_PER_WINDOW = 3

/** POST /api/otp/send */
export async function send(req, res, next) {
  const email = req.validated.email.toLowerCase()

  const windowStart = new Date(Date.now() - OTP_TTL_MINUTES * 60 * 1000)
  const recentCount = await OtpVerification.countDocuments({
    email,
    createdAt: { $gte: windowStart },
  })

  if (recentCount >= MAX_PER_WINDOW) {
    return next(
      tooManyRequests("Too many OTP requests. Please wait 10 minutes before trying again."),
    )
  }

  const otp = String(randomInt(100000, 1000000))

  await OtpVerification.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
  })

  if (!(await sendOtpEmail(email, otp))) {
    return next(new ApiError(500, "Failed to send OTP email. Please try again."))
  }

  res.json({ message: "OTP sent to your email." })
}

/** POST /api/otp/verify — issues the email_token that /api/contact requires. */
export async function verify(req, res, next) {
  const email = req.validated.email.toLowerCase()
  const { otp } = req.validated

  const record = await OtpVerification.findOne({ email, otp, verifiedAt: null }).sort({
    createdAt: -1,
  })

  if (!record) return next(unprocessable("Invalid OTP."))

  if (record.expiresAt.getTime() < Date.now()) {
    return next(unprocessable("OTP has expired. Please request a new one."))
  }

  record.verifiedAt = new Date()
  record.emailToken = randomUUID()
  await record.save()

  // snake_case key — `useContactForm.ts` reads `res.email_token`.
  res.json({
    message: "Email verified successfully.",
    email_token: record.emailToken,
  })
}
