<script setup lang="ts">
import { FunnelIcon, MagnifyingGlassIcon, PlusIcon, UserIcon } from "@heroicons/vue/24/outline"
import type { LeadStatus } from "@/types/lead"

definePageMeta({ layout: "dashboard", middleware: ["auth", "role"], meta: { roles: ["admin", "sales"] } })

const leadsStore = useLeadsStore()

onMounted(() => leadsStore.fetchLeads())

const search = ref("")
const statusFilter = ref<LeadStatus | "all">("all")
const showAddModal = ref(false)

const newLead = reactive({ name: "", email: "", phone: "", tourInterest: "", message: "" })
const addingLead = ref(false)

const filtered = computed(() => {
  return leadsStore.leads.filter((l) => {
    const matchesStatus = statusFilter.value === "all" || l.status === statusFilter.value
    const q = search.value.toLowerCase()
    const matchesSearch =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.includes(q)
    return matchesStatus && matchesSearch
  })
})

const statusOptions: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "in-progress", label: "In Progress" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
]

const statusConfig: Record<LeadStatus, { label: string; classes: string }> = {
  new: { label: "New", classes: "bg-blue-100 text-blue-700" },
  contacted: { label: "Contacted", classes: "bg-yellow-100 text-yellow-700" },
  "in-progress": { label: "In Progress", classes: "bg-purple-100 text-purple-700" },
  won: { label: "Won", classes: "bg-green-100 text-green-700" },
  lost: { label: "Lost", classes: "bg-red-100 text-red-700" },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

async function submitNewLead() {
  if (!newLead.name || !newLead.email || !newLead.phone || !newLead.message) return
  addingLead.value = true
  try {
    await leadsStore.createManualLead({ ...newLead })
    showAddModal.value = false
    Object.assign(newLead, { name: "", email: "", phone: "", tourInterest: "", message: "" })
  } finally {
    addingLead.value = false
  }
}

const statCards = computed(() => [
  { label: "Total", value: leadsStore.leads.length, color: "bg-brand-50 text-brand-700" },
  { label: "New", value: leadsStore.statusCounts.new, color: "bg-blue-50 text-blue-700" },
  { label: "In Progress", value: leadsStore.statusCounts["in-progress"], color: "bg-purple-50 text-purple-700" },
  { label: "Won", value: leadsStore.statusCounts.won, color: "bg-green-50 text-green-700" },
])
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-heading text-2xl font-bold text-dark-900">Leads</h1>
        <p class="mt-0.5 text-sm text-dark-400">Manage and track all enquiries</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 transition"
        @click="showAddModal = true">
        <PlusIcon class="h-4 w-4" />
        Add Lead
      </button>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        :class="['rounded-xl p-4', card.color]">
        <p class="text-2xl font-bold font-heading">{{ card.value }}</p>
        <p class="text-xs font-medium mt-0.5">{{ card.label }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
        <input
          v-model="search"
          type="search"
          placeholder="Search by name, email or phone…"
          class="w-full rounded-xl border border-dark-200 bg-white py-2.5 pl-9 pr-4 text-sm text-dark-700 placeholder-dark-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
      </div>
      <div class="flex items-center gap-2">
        <FunnelIcon class="h-4 w-4 text-dark-400" />
        <select
          v-model="statusFilter"
          class="rounded-xl border border-dark-200 bg-white px-3 py-2.5 text-sm text-dark-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100">
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-2xl border border-dark-100 bg-white shadow-sm">
      <div v-if="leadsStore.loading" class="flex items-center justify-center py-20">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>

      <div v-else-if="filtered.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <UserIcon class="h-12 w-12 text-dark-200" />
        <p class="mt-3 text-sm text-dark-400">No leads found</p>
      </div>

      <table v-else class="w-full text-sm">
        <thead class="border-b border-dark-100 bg-dark-50">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-dark-500">Name</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 sm:table-cell">Contact</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 md:table-cell">Tour Interest</th>
            <th class="px-4 py-3 text-left font-semibold text-dark-500">Status</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 lg:table-cell">Date</th>
            <th class="px-4 py-3 text-left font-semibold text-dark-500">Source</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-dark-50">
          <tr
            v-for="lead in filtered"
            :key="lead.id"
            class="hover:bg-brand-50/30 transition-colors">
            <td class="px-4 py-3">
              <p class="font-medium text-dark-900">{{ lead.name }}</p>
              <p class="text-xs text-dark-400 sm:hidden">{{ lead.email }}</p>
            </td>
            <td class="hidden px-4 py-3 sm:table-cell">
              <p class="text-dark-700">{{ lead.email }}</p>
              <p class="text-xs text-dark-400">{{ lead.phone }}</p>
            </td>
            <td class="hidden px-4 py-3 text-dark-500 md:table-cell">{{ lead.tourInterest || "—" }}</td>
            <td class="px-4 py-3">
              <span
                :class="['inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', statusConfig[lead.status].classes]">
                {{ statusConfig[lead.status].label }}
              </span>
            </td>
            <td class="hidden px-4 py-3 text-dark-400 lg:table-cell text-xs">{{ formatDate(lead.createdAt) }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex rounded-full bg-dark-100 px-2.5 py-0.5 text-xs font-medium text-dark-600 capitalize">
                {{ lead.source === "contact-form" ? "Form" : "Manual" }}
              </span>
            </td>
            <td class="px-4 py-3">
              <NuxtLink
                :to="`/dashboard/leads/${lead.id}`"
                class="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline">
                View →
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Lead Modal -->
    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/40 backdrop-blur-sm p-4"
        @click.self="showAddModal = false">
        <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <h2 class="font-heading text-xl font-bold text-dark-900">Add Manual Lead</h2>
          <div class="mt-4 space-y-3">
            <input v-model="newLead.name" type="text" placeholder="Full Name *" class="lead-input" />
            <input v-model="newLead.email" type="email" placeholder="Email *" class="lead-input" />
            <input v-model="newLead.phone" type="tel" placeholder="Phone *" class="lead-input" />
            <input v-model="newLead.tourInterest" type="text" placeholder="Tour Interest" class="lead-input" />
            <textarea v-model="newLead.message" rows="3" placeholder="Message *" class="lead-input resize-none" />
          </div>
          <div class="mt-5 flex justify-end gap-3">
            <button
              class="rounded-xl border border-dark-200 px-4 py-2 text-sm font-medium text-dark-600 hover:bg-dark-50 transition"
              @click="showAddModal = false">
              Cancel
            </button>
            <button
              class="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition disabled:opacity-50"
              :disabled="addingLead"
              @click="submitNewLead">
              {{ addingLead ? "Adding…" : "Add Lead" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.lead-input {
  @apply w-full rounded-xl border border-dark-200 px-3 py-2.5 text-sm text-dark-700 placeholder-dark-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100;
}
</style>
