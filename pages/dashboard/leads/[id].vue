<script setup lang="ts">
import { ArrowLeftIcon, PaperAirplaneIcon } from "@heroicons/vue/24/outline"
import type { Lead, LeadStatus } from "@/types/lead"

definePageMeta({ layout: "dashboard", middleware: ["auth", "role"], meta: { roles: ["admin", "sales"] } })

const route = useRoute()
const leadsStore = useLeadsStore()

const lead = ref<Lead | null>(null)
const loading = ref(true)
const noteText = ref("")
const submittingNote = ref(false)
const updatingStatus = ref(false)

onMounted(async () => {
  lead.value = await leadsStore.fetchLead(route.params.id as string)
  loading.value = false
})

const statusOptions: { value: LeadStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "text-blue-600" },
  { value: "contacted", label: "Contacted", color: "text-yellow-600" },
  { value: "in-progress", label: "In Progress", color: "text-purple-600" },
  { value: "won", label: "Won", color: "text-green-600" },
  { value: "lost", label: "Lost", color: "text-red-600" },
]

const statusConfig: Record<LeadStatus, { label: string; classes: string }> = {
  new: { label: "New", classes: "bg-blue-100 text-blue-700" },
  contacted: { label: "Contacted", classes: "bg-yellow-100 text-yellow-700" },
  "in-progress": { label: "In Progress", classes: "bg-purple-100 text-purple-700" },
  won: { label: "Won", classes: "bg-green-100 text-green-700" },
  lost: { label: "Lost", classes: "bg-red-100 text-red-700" },
}

async function changeStatus(status: LeadStatus) {
  if (!lead.value) return
  updatingStatus.value = true
  try {
    lead.value = await leadsStore.updateStatus(lead.value.id, status)
  } finally {
    updatingStatus.value = false
  }
}

async function submitNote() {
  if (!lead.value || !noteText.value.trim()) return
  submittingNote.value = true
  try {
    lead.value = await leadsStore.addNote(lead.value.id, noteText.value.trim())
    noteText.value = ""
  } finally {
    submittingNote.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  })
}
</script>

<template>
  <div class="p-6">
    <NuxtLink
      to="/dashboard/leads"
      class="inline-flex items-center gap-1.5 text-sm text-dark-500 hover:text-brand-600 transition mb-6">
      <ArrowLeftIcon class="h-4 w-4" />
      Back to Leads
    </NuxtLink>

    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
    </div>

    <div v-else-if="!lead" class="py-32 text-center text-dark-400">Lead not found.</div>

    <div v-else class="grid gap-6 lg:grid-cols-3">
      <!-- Left: Lead info + notes -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Lead info card -->
        <div class="rounded-2xl border border-dark-100 bg-white p-6 shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h1 class="font-heading text-2xl font-bold text-dark-900">{{ lead.name }}</h1>
              <p class="mt-0.5 text-sm text-dark-400">
                {{ lead.source === "contact-form" ? "Contact Form" : "Manual Entry" }} ·
                {{ formatDate(lead.createdAt) }}
              </p>
            </div>
            <span :class="['inline-flex rounded-full px-3 py-1 text-xs font-semibold', statusConfig[lead.status].classes]">
              {{ statusConfig[lead.status].label }}
            </span>
          </div>

          <dl class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium text-dark-400 uppercase tracking-wide">Email</dt>
              <dd class="mt-1 text-sm text-dark-700">
                <a :href="`mailto:${lead.email}`" class="text-brand-600 hover:underline">{{ lead.email }}</a>
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-dark-400 uppercase tracking-wide">Phone</dt>
              <dd class="mt-1 text-sm text-dark-700">
                <a :href="`tel:${lead.phone}`" class="text-brand-600 hover:underline">{{ lead.phone }}</a>
              </dd>
            </div>
            <div v-if="lead.tourInterest">
              <dt class="text-xs font-medium text-dark-400 uppercase tracking-wide">Tour Interest</dt>
              <dd class="mt-1 text-sm text-dark-700">{{ lead.tourInterest }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-dark-400 uppercase tracking-wide">Last Updated</dt>
              <dd class="mt-1 text-sm text-dark-700">{{ formatDate(lead.updatedAt) }}</dd>
            </div>
          </dl>

          <div class="mt-6 border-t border-dark-100 pt-5">
            <p class="text-xs font-medium text-dark-400 uppercase tracking-wide mb-2">Message</p>
            <p class="text-sm text-dark-700 leading-relaxed whitespace-pre-line">{{ lead.message }}</p>
          </div>
        </div>

        <!-- Notes timeline -->
        <div class="rounded-2xl border border-dark-100 bg-white p-6 shadow-sm">
          <h2 class="font-heading text-lg font-bold text-dark-900 mb-5">
            Notes <span class="text-sm font-normal text-dark-400">({{ lead.notes.length }})</span>
          </h2>

          <div v-if="lead.notes.length === 0" class="py-8 text-center text-sm text-dark-400">
            No notes yet. Add the first one below.
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="note in [...lead.notes].reverse()"
              :key="note.id"
              class="flex gap-3">
              <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {{ note.authorName.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 rounded-xl border border-dark-100 bg-dark-50 p-4">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-semibold text-dark-800">{{ note.authorName }}</span>
                  <span class="text-xs text-dark-400">{{ formatDate(note.createdAt) }}</span>
                </div>
                <p class="mt-2 text-sm text-dark-700 whitespace-pre-line">{{ note.content }}</p>
              </div>
            </div>
          </div>

          <!-- Add note form -->
          <div class="mt-6 border-t border-dark-100 pt-5">
            <textarea
              v-model="noteText"
              rows="3"
              placeholder="Write a note…"
              class="w-full rounded-xl border border-dark-200 px-3 py-2.5 text-sm text-dark-700 placeholder-dark-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 resize-none" />
            <div class="mt-2 flex justify-end">
              <button
                :disabled="!noteText.trim() || submittingNote"
                class="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition disabled:opacity-40"
                @click="submitNote">
                <PaperAirplaneIcon class="h-4 w-4" />
                {{ submittingNote ? "Saving…" : "Add Note" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Status panel -->
      <div class="space-y-6">
        <div class="rounded-2xl border border-dark-100 bg-white p-6 shadow-sm">
          <h2 class="font-heading text-base font-bold text-dark-900 mb-4">Update Status</h2>
          <div class="space-y-2">
            <button
              v-for="opt in statusOptions"
              :key="opt.value"
              :class="[
                'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition',
                lead.status === opt.value
                  ? 'border-brand-400 bg-brand-50 text-brand-700 ring-1 ring-brand-400'
                  : 'border-dark-100 hover:border-brand-200 hover:bg-dark-50',
                opt.color,
              ]"
              :disabled="updatingStatus || lead.status === opt.value"
              @click="changeStatus(opt.value)">
              <span
                :class="[
                  'h-2.5 w-2.5 rounded-full flex-shrink-0',
                  opt.value === 'new' ? 'bg-blue-500' :
                  opt.value === 'contacted' ? 'bg-yellow-500' :
                  opt.value === 'in-progress' ? 'bg-purple-500' :
                  opt.value === 'won' ? 'bg-green-500' : 'bg-red-500',
                ]" />
              {{ opt.label }}
              <svg v-if="lead.status === opt.value" class="ml-auto h-4 w-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="rounded-2xl border border-dark-100 bg-white p-6 shadow-sm">
          <h2 class="font-heading text-base font-bold text-dark-900 mb-4">Quick Actions</h2>
          <div class="space-y-2">
            <a
              :href="`mailto:${lead.email}?subject=Re: Tour Enquiry`"
              class="flex w-full items-center gap-3 rounded-xl border border-dark-100 px-4 py-3 text-sm font-medium text-dark-700 hover:border-brand-200 hover:bg-dark-50 transition">
              <svg class="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              Send Email
            </a>
            <a
              :href="`https://wa.me/${lead.phone.replace(/\D/g, '')}`"
              target="_blank"
              rel="noopener"
              class="flex w-full items-center gap-3 rounded-xl border border-dark-100 px-4 py-3 text-sm font-medium text-dark-700 hover:border-brand-200 hover:bg-dark-50 transition">
              <svg class="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
