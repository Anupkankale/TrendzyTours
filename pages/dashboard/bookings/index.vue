<script setup lang="ts">
import { CalendarIcon, FunnelIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/vue/24/outline"
import type { BookingSource, BookingStatus } from "@/types/booking"

definePageMeta({ layout: "dashboard", middleware: ["auth", "role"], meta: { roles: ["admin", "sales"] } })

const bookingsStore = useBookingsStore()

onMounted(() => bookingsStore.fetchBookings())

// ── Filters ────────────────────────────────────────────────────────────────
const search = ref("")
const statusFilter = ref<BookingStatus | "all">("all")
const dateFrom = ref("")
const dateTo = ref("")

const statusOptions: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
]

const statusConfig: Record<BookingStatus, { label: string; classes: string }> = {
  pending:   { label: "Pending",   classes: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmed", classes: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", classes: "bg-red-100 text-red-700" },
}

const filtered = computed(() => {
  return bookingsStore.bookings.filter((b) => {
    if (statusFilter.value !== "all" && b.status !== statusFilter.value) return false
    if (dateFrom.value && b.travelDate < dateFrom.value) return false
    if (dateTo.value && b.travelDate > dateTo.value) return false
    const q = search.value.toLowerCase()
    if (q) {
      const match =
        b.customerName.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.tourName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q)
      if (!match) return false
    }
    return true
  })
})

const statCards = computed(() => [
  { label: "Total",     value: bookingsStore.bookings.length,        color: "bg-brand-50 text-brand-700" },
  { label: "Pending",   value: bookingsStore.statusCounts.pending,   color: "bg-yellow-50 text-yellow-700" },
  { label: "Confirmed", value: bookingsStore.statusCounts.confirmed, color: "bg-green-50 text-green-700" },
  { label: "Cancelled", value: bookingsStore.statusCounts.cancelled, color: "bg-red-50 text-red-700" },
])

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

// ── New Booking Modal ───────────────────────────────────────────────────────
const showModal = ref(false)
const submitting = ref(false)
const formError = ref("")

const form = reactive({
  tourId: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  travelDate: "",
  adults: 1,
  children: 0,
  message: "",
  source: "call" as BookingSource,
  status: "pending" as BookingStatus,
})

const sourceOptions: { value: BookingSource; label: string }[] = [
  { value: "call",      label: "Phone Call" },
  { value: "reference", label: "Reference / Agent" },
  { value: "walk-in",   label: "Walk-in" },
]

async function openModal() {
  showModal.value = true
  formError.value = ""
  await bookingsStore.fetchTourOptions()
}

function closeModal() {
  showModal.value = false
  Object.assign(form, {
    tourId: "", customerName: "", customerEmail: "", customerPhone: "",
    travelDate: "", adults: 1, children: 0, message: "", source: "call", status: "pending",
  })
  formError.value = ""
}

async function submitBooking() {
  if (!form.tourId || !form.customerName || !form.customerEmail || !form.customerPhone || !form.travelDate) {
    formError.value = "Please fill in all required fields."
    return
  }
  submitting.value = true
  formError.value = ""
  try {
    await bookingsStore.createBooking({ ...form })
    closeModal()
  } catch (e: unknown) {
    formError.value = e instanceof Error ? e.message : "Failed to create booking. Please try again."
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-heading text-2xl font-bold text-dark-900">Bookings</h1>
        <p class="mt-0.5 text-sm text-dark-400">Track and manage all tour bookings</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
        @click="openModal">
        <PlusIcon class="h-4 w-4" />
        New Booking
      </button>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        :class="['rounded-xl p-4', card.color]">
        <p class="font-heading text-2xl font-bold">{{ card.value }}</p>
        <p class="mt-0.5 text-xs font-medium">{{ card.label }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      <div class="relative flex-1 min-w-48">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
        <input
          v-model="search"
          type="search"
          placeholder="Search customer, email, tour…"
          class="w-full rounded-xl border border-dark-200 bg-white py-2.5 pl-9 pr-4 text-sm text-dark-700 placeholder-dark-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
      </div>
      <div class="flex items-center gap-2">
        <FunnelIcon class="h-4 w-4 flex-shrink-0 text-dark-400" />
        <select
          v-model="statusFilter"
          class="rounded-xl border border-dark-200 bg-white px-3 py-2.5 text-sm text-dark-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100">
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <CalendarIcon class="h-4 w-4 flex-shrink-0 text-dark-400" />
        <input
          v-model="dateFrom"
          type="date"
          class="rounded-xl border border-dark-200 bg-white px-3 py-2.5 text-sm text-dark-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
        <span class="text-sm text-dark-400">to</span>
        <input
          v-model="dateTo"
          type="date"
          class="rounded-xl border border-dark-200 bg-white px-3 py-2.5 text-sm text-dark-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-2xl border border-dark-100 bg-white shadow-sm">
      <div v-if="bookingsStore.loading" class="flex items-center justify-center py-20">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
      <div v-else-if="filtered.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <CalendarIcon class="h-12 w-12 text-dark-200" />
        <p class="mt-3 text-sm text-dark-400">No bookings found</p>
      </div>
      <table v-else class="w-full text-sm">
        <thead class="border-b border-dark-100 bg-dark-50">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-dark-500">Customer</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 md:table-cell">Tour</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 sm:table-cell">Travel Date</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 lg:table-cell">Pax</th>
            <th class="px-4 py-3 text-left font-semibold text-dark-500">Status</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 xl:table-cell">Source</th>
            <th class="hidden px-4 py-3 text-left font-semibold text-dark-500 xl:table-cell">Booked On</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-dark-50">
          <tr
            v-for="booking in filtered"
            :key="booking.id"
            class="transition-colors hover:bg-brand-50/30">
            <td class="px-4 py-3">
              <p class="font-medium text-dark-900">{{ booking.customerName }}</p>
              <p class="text-xs text-dark-400">{{ booking.customerEmail }}</p>
            </td>
            <td class="hidden px-4 py-3 text-dark-600 md:table-cell">{{ booking.tourName }}</td>
            <td class="hidden px-4 py-3 text-dark-600 sm:table-cell">{{ formatDate(booking.travelDate) }}</td>
            <td class="hidden px-4 py-3 text-dark-500 lg:table-cell">
              {{ booking.adults }}A{{ booking.children > 0 ? ` · ${booking.children}C` : "" }}
            </td>
            <td class="px-4 py-3">
              <span :class="['inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', statusConfig[booking.status].classes]">
                {{ statusConfig[booking.status].label }}
              </span>
            </td>
            <td class="hidden px-4 py-3 xl:table-cell">
              <span class="inline-flex rounded-full bg-dark-100 px-2.5 py-0.5 text-xs font-medium text-dark-600 capitalize">
                {{ booking.source }}
              </span>
            </td>
            <td class="hidden px-4 py-3 text-xs text-dark-400 xl:table-cell">{{ formatDate(booking.createdAt) }}</td>
            <td class="px-4 py-3">
              <NuxtLink
                :to="`/dashboard/bookings/${booking.id}`"
                class="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline">
                View →
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- New Booking Modal -->
  <Teleport to="body">
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-dark-950/40 backdrop-blur-sm p-4 pt-16"
      @click.self="closeModal">
      <div class="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <h2 class="font-heading text-xl font-bold text-dark-900">New Booking</h2>
        <p class="mt-0.5 text-sm text-dark-400">Create a manual booking from a call, reference, or walk-in.</p>

        <div class="mt-5 space-y-4">
          <!-- Tour -->
          <div>
            <label class="booking-label">Tour *</label>
            <select v-model="form.tourId" class="booking-input">
              <option value="" disabled>Select a tour…</option>
              <option
                v-for="tour in bookingsStore.tourOptions"
                :key="tour.id"
                :value="tour.id">
                {{ tour.name }} — {{ tour.destination }}
              </option>
            </select>
          </div>

          <!-- Customer Name + Phone -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="booking-label">Customer Name *</label>
              <input v-model="form.customerName" type="text" placeholder="Full name" class="booking-input" />
            </div>
            <div>
              <label class="booking-label">Phone *</label>
              <input v-model="form.customerPhone" type="tel" placeholder="Mobile number" class="booking-input" />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="booking-label">Email *</label>
            <input v-model="form.customerEmail" type="email" placeholder="customer@email.com" class="booking-input" />
          </div>

          <!-- Travel Date + Adults + Children -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div class="sm:col-span-1">
              <label class="booking-label">Travel Date *</label>
              <input v-model="form.travelDate" type="date" class="booking-input" />
            </div>
            <div>
              <label class="booking-label">Adults *</label>
              <input v-model.number="form.adults" type="number" min="1" class="booking-input" />
            </div>
            <div>
              <label class="booking-label">Children</label>
              <input v-model.number="form.children" type="number" min="0" class="booking-input" />
            </div>
          </div>

          <!-- Source + Initial Status -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="booking-label">Source *</label>
              <select v-model="form.source" class="booking-input">
                <option v-for="opt in sourceOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div>
              <label class="booking-label">Initial Status</label>
              <select v-model="form.status" class="booking-input">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
              </select>
            </div>
          </div>

          <!-- Message -->
          <div>
            <label class="booking-label">Notes / Special Requests</label>
            <textarea
              v-model="form.message"
              rows="3"
              placeholder="Any special requirements, reference name, remarks…"
              class="booking-input resize-none" />
          </div>

          <!-- Error -->
          <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex justify-end gap-3">
          <button
            class="rounded-xl border border-dark-200 px-4 py-2 text-sm font-medium text-dark-600 transition hover:bg-dark-50"
            @click="closeModal">
            Cancel
          </button>
          <button
            class="rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
            :disabled="submitting"
            @click="submitBooking">
            {{ submitting ? "Creating…" : "Create Booking" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.booking-label {
  @apply mb-1.5 block text-xs font-medium text-dark-600;
}
.booking-input {
  @apply w-full rounded-xl border border-dark-200 px-3 py-2.5 text-sm text-dark-700 placeholder-dark-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100;
}
</style>
