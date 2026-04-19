import { defineStore } from "pinia"
import type { Lead, LeadStatus } from "@/types/lead"

export const useLeadsStore = defineStore("leads", () => {
  const { apiFetch } = useApi()
  const leads = ref<Lead[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLeads() {
    loading.value = true
    error.value = null
    try {
      leads.value = await apiFetch<Lead[]>("/api/leads")
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load leads"
    } finally {
      loading.value = false
    }
  }

  async function fetchLead(id: string): Promise<Lead | null> {
    try {
      return await apiFetch<Lead>(`/api/leads/${id}`)
    } catch {
      return null
    }
  }

  async function updateStatus(id: string, status: LeadStatus) {
    const lead = await apiFetch<Lead>(`/api/leads/${id}`, {
      method: "PUT",
      body: { status },
    })
    const idx = leads.value.findIndex((l) => l.id === id)
    if (idx >= 0) leads.value[idx] = lead
    return lead
  }

  async function addNote(id: string, note: string) {
    const lead = await apiFetch<Lead>(`/api/leads/${id}`, {
      method: "PUT",
      body: { note },
    })
    const idx = leads.value.findIndex((l) => l.id === id)
    if (idx >= 0) leads.value[idx] = lead
    return lead
  }

  async function createManualLead(data: {
    name: string; email: string; phone: string; tourInterest?: string; message: string
  }) {
    const lead = await apiFetch<Lead>("/api/leads", { method: "POST", body: data })
    leads.value.unshift(lead)
    return lead
  }

  const statusCounts = computed(() => {
    const counts: Record<string, number> = { new: 0, contacted: 0, "in-progress": 0, won: 0, lost: 0 }
    for (const l of leads.value) counts[l.status] = (counts[l.status] ?? 0) + 1
    return counts
  })

  return { leads, loading, error, statusCounts, fetchLeads, fetchLead, updateStatus, addNote, createManualLead }
})
