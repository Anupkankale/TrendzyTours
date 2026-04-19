import type { Lead, LeadNote, LeadStatus } from "@/types/lead"
import { randomUUID } from "uncrypto"

const STORAGE_KEY = "leads:all"

async function getStorage() {
  return useStorage("leads")
}

export async function getAllLeads(): Promise<Lead[]> {
  const storage = await getStorage()
  const leads = await storage.getItem<Lead[]>(STORAGE_KEY)
  return leads ?? []
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const leads = await getAllLeads()
  return leads.find((l) => l.id === id) ?? null
}

export async function saveLead(lead: Lead): Promise<void> {
  const leads = await getAllLeads()
  const idx = leads.findIndex((l) => l.id === lead.id)
  if (idx >= 0) leads[idx] = lead
  else leads.unshift(lead)
  const storage = await getStorage()
  await storage.setItem(STORAGE_KEY, leads)
}

export async function createLead(data: {
  name: string
  email: string
  phone: string
  tourInterest?: string
  message: string
  source: Lead["source"]
}): Promise<Lead> {
  const now = new Date().toISOString()
  const lead: Lead = {
    id: randomUUID(),
    ...data,
    status: "new",
    notes: [],
    createdAt: now,
    updatedAt: now,
  }
  await saveLead(lead)
  return lead
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
  const lead = await getLeadById(id)
  if (!lead) throw createError({ statusCode: 404, statusMessage: "Lead not found" })
  lead.status = status
  lead.updatedAt = new Date().toISOString()
  await saveLead(lead)
  return lead
}

export async function addLeadNote(
  id: string,
  note: { content: string; authorName: string; authorEmail: string }
): Promise<Lead> {
  const lead = await getLeadById(id)
  if (!lead) throw createError({ statusCode: 404, statusMessage: "Lead not found" })
  const newNote: LeadNote = {
    id: randomUUID(),
    content: note.content,
    authorName: note.authorName,
    authorEmail: note.authorEmail,
    createdAt: new Date().toISOString(),
  }
  lead.notes.push(newNote)
  lead.updatedAt = new Date().toISOString()
  await saveLead(lead)
  return lead
}
