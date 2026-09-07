import { toIsoString } from "../utils/date.js"

/** Mirrors app/Http/Resources/LeadNoteResource.php */
function serializeLeadNote(note) {
  return {
    id: note._id,
    content: note.content,
    authorName: note.authorName,
    authorEmail: note.authorEmail,
    createdAt: toIsoString(note.createdAt),
  }
}

/** Mirrors app/Http/Resources/LeadResource.php */
export function serializeLead(lead) {
  const notes = [...(lead.notes ?? [])].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  )

  return {
    id: lead._id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    tourInterest: lead.tourInterest ?? null,
    message: lead.message,
    status: lead.status,
    source: lead.source,
    notes: notes.map(serializeLeadNote),
    createdAt: toIsoString(lead.createdAt),
    updatedAt: toIsoString(lead.updatedAt),
  }
}

export const serializeLeads = (leads) => leads.map(serializeLead)
