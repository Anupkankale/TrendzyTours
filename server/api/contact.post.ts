import { z } from "zod"
import { createLead } from "../utils/leads"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  tourInterest: z.string().optional(),
  message: z.string().min(10),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: "Invalid form data" })
  }

  const { name, email, phone, tourInterest, message } = result.data

  await createLead({ name, email, phone, tourInterest, message, source: "contact-form" })

  const config = useRuntimeConfig()

  if (config.brevoApiKey) {
    await $fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": config.brevoApiKey,
        "Content-Type": "application/json",
      },
      body: {
        sender: { name: "Trendzy Tours Website", email: "noreply@trendzytours.com" },
        to: [{ email: "support@trendzytours.com", name: "Trendzy Tours" }],
        subject: `New Enquiry from ${name}`,
        htmlContent: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          ${tourInterest ? `<p><strong>Tour Interest:</strong> ${tourInterest}</p>` : ""}
          <p><strong>Message:</strong> ${message}</p>
        `,
      },
    })
  }

  return { success: true }
})
