export type LeadStatus = "new" | "contacted" | "in-progress" | "won" | "lost"

export interface LeadNote {
  id: string
  content: string
  authorName: string
  authorEmail: string
  createdAt: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  tourInterest?: string
  message: string
  status: LeadStatus
  notes: LeadNote[]
  source: "contact-form" | "manual"
  createdAt: string
  updatedAt: string
}
