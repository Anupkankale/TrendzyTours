import { env } from "../config/env.js"
import { Lead } from "../models/Lead.js"
import { OtpVerification } from "../models/OtpVerification.js"
import { sendLeadNotification } from "../services/brevoService.js"
import { unprocessable } from "../utils/ApiError.js"

/**
 * POST /api/contact
 *
 * With OTP_REQUIRED on (the default) this is the Laravel behaviour: the
 * request must carry an email_token from /api/otp/verify, for the same address.
 * With it off, the token is optional — but a valid one is still consumed, so
 * a frontend that keeps doing the OTP dance behaves exactly as before.
 */
export async function store(req, res, next) {
  const data = req.validated

  const record = data.emailToken
    ? await OtpVerification.findOne({
        emailToken: data.emailToken,
        verifiedAt: { $ne: null },
      })
    : null

  if (env.otpRequired) {
    if (!record) {
      return next(
        unprocessable("Email not verified. Please verify your email with the OTP and try again.", {
          emailToken: ["Invalid or expired verification token."],
        }),
      )
    }

    if (record.email.toLowerCase() !== data.email.toLowerCase()) {
      return next(
        unprocessable("Email mismatch. Please verify the same email you entered in the form.", {
          email: ["Verified email does not match."],
        }),
      )
    }
  }

  const lead = await Lead.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    tourInterest: data.tourInterest ?? null,
    message: data.message,
    source: "contact-form",
    status: "new",
  })

  // The token is single-use whether or not it was mandatory.
  if (record) await record.deleteOne()

  await sendLeadNotification(lead)

  res.json({ success: true })
}
