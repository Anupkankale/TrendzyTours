import { env } from "../config/env.js"

const BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email"
const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts"

async function brevoPost(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": env.brevo.apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(`Brevo ${response.status}: ${detail.slice(0, 300)}`)
  }

  return response
}

/** Ported verbatim from App\Services\EmailOtpService::buildEmailHtml(). */
function otpEmailHtml(otp) {
  return `
        <div style='font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff;'>
            <div style='text-align: center; margin-bottom: 32px;'>
                <h1 style='font-size: 24px; color: #1a1a2e; margin: 0;'>Trendzy Tours</h1>
                <p style='color: #6b7280; margin: 8px 0 0;'>Email Verification</p>
            </div>

            <p style='color: #374151; font-size: 15px; line-height: 1.6;'>
                Use the verification code below to confirm your email address. This code expires in <strong>10 minutes</strong>.
            </p>

            <div style='background: #f9f5eb; border-radius: 12px; padding: 28px; text-align: center; margin: 28px 0;'>
                <p style='margin: 0 0 8px; color: #6b7280; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase;'>Your OTP Code</p>
                <p style='margin: 0; font-size: 42px; font-weight: 700; letter-spacing: 10px; color: #b8962e;'>${otp}</p>
            </div>

            <p style='color: #9ca3af; font-size: 13px; line-height: 1.5;'>
                If you didn't request this, please ignore this email. Do not share this code with anyone.
            </p>

            <hr style='border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;'>
            <p style='color: #9ca3af; font-size: 12px; text-align: center; margin: 0;'>
                &copy; Trendzy Tours, Nagpur &nbsp;|&nbsp; trendzytours.com
            </p>
        </div>
        `
}

/**
 * Returns false instead of throwing — OtpController turns that into the same
 * 500 "Failed to send OTP email" the Laravel version returned.
 */
export async function sendOtpEmail(email, otp) {
  if (!env.brevo.apiKey) {
    // Locally this mirrors Laravel's `log` mailer: print the code and report
    // success so the contact form is testable without a Brevo key. In
    // production a missing key is a real failure and must surface as one.
    console.warn(`[brevo] BREVO_API_KEY not set — OTP for ${email} is ${otp} (not emailed)`)
    return !env.isProduction
  }

  try {
    await brevoPost(BREVO_EMAIL_URL, {
      sender: { name: "Trendzy Tours", email: env.brevo.senderEmail },
      to: [{ email }],
      subject: "Your Trendzy Tours Verification Code",
      htmlContent: otpEmailHtml(otp),
    })
    return true
  } catch (error) {
    console.error("[brevo] OTP send failed:", error.message)
    return false
  }
}

/** Port of ContactController::sendNotificationEmail — best effort, never throws. */
export async function sendLeadNotification(lead) {
  if (!env.brevo.apiKey) return

  try {
    await brevoPost(BREVO_EMAIL_URL, {
      sender: { name: "Trendzy Tours", email: env.brevo.senderEmail },
      to: [{ email: env.brevo.notifyEmail }],
      subject: `New Enquiry from ${lead.name}`,
      htmlContent: `
                        <h2>New Contact Form Submission</h2>
                        <p><strong>Name:</strong> ${lead.name}</p>
                        <p><strong>Email:</strong> ${lead.email}</p>
                        <p><strong>Phone:</strong> ${lead.phone}</p>
                        <p><strong>Tour Interest:</strong> ${lead.tourInterest ?? ""}</p>
                        <p><strong>Message:</strong> ${lead.message}</p>
                    `,
    })
  } catch (error) {
    console.error("[brevo] Contact notification email failed:", error.message)
  }
}

/** Port of NewsletterController::subscribe — best effort, never throws. */
export async function subscribeToNewsletter(email) {
  if (!env.brevo.apiKey || !env.brevo.listId) return

  try {
    await brevoPost(BREVO_CONTACTS_URL, {
      email,
      listIds: [Number(env.brevo.listId)],
      updateEnabled: true,
    })
  } catch (error) {
    console.warn("[brevo] Newsletter subscription failed:", error.message)
  }
}
