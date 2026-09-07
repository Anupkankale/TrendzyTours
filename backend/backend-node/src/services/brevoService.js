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
