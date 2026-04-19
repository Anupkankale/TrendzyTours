import { getLeadById } from "../../utils/leads"
import { requireAuth } from "../../utils/requireAuth"

export default defineEventHandler(async (event) => {
  await requireAuth(event, ["admin", "sales"])
  const id = getRouterParam(event, "id")!
  const lead = await getLeadById(id)
  if (!lead) throw createError({ statusCode: 404, statusMessage: "Lead not found" })
  return lead
})
