import { Lead } from "../models/Lead.js"
import { sendLeadNotification } from "../services/brevoService.js"

/**
 * POST /api/contact
 *
 * Public and unauthenticated. The email OTP that used to gate this was
 * removed, so the submitted details alone become a lead; the notification
 * email is best effort and never blocks the response. Abuse is held off by
 * contactLimiter in the route rather than by email verification.
 */
export async function store(req, res) {
  const data = req.validated

  const lead = await Lead.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    tourInterest: data.tourInterest ?? null,
    message: data.message,
    source: "contact-form",
    status: "new",
  })

  await sendLeadNotification(lead)

  res.json({ success: true })
}
