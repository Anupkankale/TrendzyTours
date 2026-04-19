import { getAllLeads } from "../../utils/leads"
import { requireAuth } from "../../utils/requireAuth"

export default defineEventHandler(async (event) => {
  await requireAuth(event, ["admin", "sales"])
  const leads = await getAllLeads()
  return leads
})
