import { z } from "zod"
import { createLead } from "../../utils/leads"
import { requireAuth } from "../../utils/requireAuth"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  tourInterest: z.string().optional(),
  message: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  await requireAuth(event, ["admin", "sales"])
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, statusMessage: "Invalid data" })
  const { name, email, phone, tourInterest, message } = result.data
  const lead = await createLead({ name, email, phone, tourInterest, message, source: "manual" })
  return lead
})
