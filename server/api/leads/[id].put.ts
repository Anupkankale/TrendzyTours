import { z } from "zod"
import { updateLeadStatus, addLeadNote } from "../../utils/leads"
import { requireAuth } from "../../utils/requireAuth"

const schema = z.object({
  status: z.enum(["new", "contacted", "in-progress", "won", "lost"]).optional(),
  note: z.string().min(1).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ["admin", "sales"])
  const id = getRouterParam(event, "id")!
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, statusMessage: "Invalid data" })

  let lead
  if (result.data.status) {
    lead = await updateLeadStatus(id, result.data.status)
  }
  if (result.data.note) {
    lead = await addLeadNote(id, {
      content: result.data.note,
      authorName: user.name,
      authorEmail: user.email,
    })
  }
  if (!lead) throw createError({ statusCode: 400, statusMessage: "Nothing to update" })
  return lead
})
