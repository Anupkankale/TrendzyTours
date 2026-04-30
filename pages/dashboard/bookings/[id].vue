<script setup lang="ts">
import { ArrowLeftIcon } from "@heroicons/vue/24/outline"
import type { Booking, BookingStatus } from "@/types/booking"

definePageMeta({ layout: "dashboard", middleware: ["auth", "role"], meta: { roles: ["admin", "sales"] } })

const route = useRoute()
const bookingsStore = useBookingsStore()

const booking = ref<Booking | null>(null)
const loading = ref(true)
const updatingStatus = ref(false)

onMounted(async () => {
  booking.value = await bookingsStore.fetchBooking(route.params.id as string)
  loading.value = false
})

const statusOptions: { value: BookingStatus; label: string; dotColor: string; textColor: string }[] = [
  { value: "pending",   label: "Pending",   dotColor: "bg-yellow-400", textColor: "text-yellow-600" },
  { value: "confirmed", label: "Confirmed", dotColor: "bg-green-500",  textColor: "text-green-600" },
  { value: "cancelled", label: "Cancelled", dotColor: "bg-red-500",    textColor: "text-red-600" },
]

const statusConfig: Record<BookingStatus, { label: string; classes: string }> = {
  pending:   { label: "Pending",   classes: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmed", classes: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", classes: "bg-red-100 text-red-700" },
}

async function changeStatus(status: BookingStatus) {
  if (!booking.value || booking.value.status === status) return
  updatingStatus.value = true
  try {
    booking.value = await bookingsStore.updateStatus(booking.value.id, status)
  } finally {
    updatingStatus.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  })
}
</script>

<template>
  <div class="p-6">
    <NuxtLink
      to="/dashboard/bookings"
      class="mb-6 inline-flex items-center gap-1.5 text-sm text-dark-500 transition hover:text-brand-600">
      <ArrowLeftIcon class="h-4 w-4" />
      Back to Bookings
    </NuxtLink>

    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
    </div>

    <div v-else-if="!booking" class="py-32 text-center text-dark-400">Booking not found.</div>

    <div v-else class="grid gap-6 lg:grid-cols-3">
      <!-- Left: Booking details -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Main card -->
        <div class="rounded-2xl border border-dark-100 bg-white p-6 shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h1 class="font-heading text-2xl font-bold text-dark-900">{{ booking.customerName }}</h1>
              <p class="mt-0.5 text-sm text-dark-400">Booked on {{ formatDateTime(booking.createdAt) }}</p>
            </div>
            <div class="flex flex-col items-end gap-2">
              <span :class="['inline-flex rounded-full px-3 py-1 text-xs font-semibold', statusConfig[booking.status].classes]">
                {{ statusConfig[booking.status].label }}
              </span>
              <span class="inline-flex rounded-full bg-dark-100 px-3 py-1 text-xs font-medium text-dark-600 capitalize">
                {{ booking.source }}
              </span>
            </div>
          </div>

          <!-- Contact details -->
          <dl class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-dark-400">Email</dt>
              <dd class="mt-1 text-sm text-dark-700">
                <a :href="`mailto:${booking.customerEmail}`" class="text-brand-600 hover:underline">
                  {{ booking.customerEmail }}
                </a>
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-dark-400">Phone</dt>
              <dd class="mt-1 text-sm text-dark-700">
                <a :href="`tel:${booking.customerPhone}`" class="text-brand-600 hover:underline">
                  {{ booking.customerPhone }}
                </a>
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-dark-400">Tour</dt>
              <dd class="mt-1 text-sm font-medium text-dark-700">{{ booking.tourName }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-dark-400">Travel Date</dt>
              <dd class="mt-1 text-sm text-dark-700">{{ formatDate(booking.travelDate) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-dark-400">Adults</dt>
              <dd class="mt-1 text-sm text-dark-700">{{ booking.adults }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-dark-400">Children</dt>
              <dd class="mt-1 text-sm text-dark-700">{{ booking.children }}</dd>
            </div>
          </dl>

          <!-- Message -->
          <div v-if="booking.message" class="mt-6 border-t border-dark-100 pt-5">
            <p class="mb-2 text-xs font-medium uppercase tracking-wide text-dark-400">Customer Message</p>
            <p class="text-sm leading-relaxed text-dark-700 whitespace-pre-line">{{ booking.message }}</p>
          </div>
        </div>
      </div>

      <!-- Right: Status + Quick actions -->
      <div class="space-y-6">
        <!-- Status update -->
        <div class="rounded-2xl border border-dark-100 bg-white p-6 shadow-sm">
          <h2 class="font-heading text-base font-bold text-dark-900 mb-4">Update Status</h2>
          <div class="space-y-2">
            <button
              v-for="opt in statusOptions"
              :key="opt.value"
              :class="[
                'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition',
                booking.status === opt.value
                  ? 'border-brand-400 bg-brand-50 text-brand-700 ring-1 ring-brand-400'
                  : 'border-dark-100 hover:border-brand-200 hover:bg-dark-50',
                opt.textColor,
              ]"
              :disabled="updatingStatus || booking.status === opt.value"
              @click="changeStatus(opt.value)">
              <span :class="['h-2.5 w-2.5 flex-shrink-0 rounded-full', opt.dotColor]" />
              {{ opt.label }}
              <svg
                v-if="booking.status === opt.value"
                class="ml-auto h-4 w-4 text-brand-500"
                fill="currentColor"
                viewBox="0 0 20 20">
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
              :href="`mailto:${booking.customerEmail}?subject=Re: Your Tour Booking – ${booking.tourName}`"
              class="flex w-full items-center gap-3 rounded-xl border border-dark-100 px-4 py-3 text-sm font-medium text-dark-700 transition hover:border-brand-200 hover:bg-dark-50">
              <svg class="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Email
            </a>
            <a
              :href="`https://wa.me/${booking.customerPhone.replace(/\D/g, '')}`"
              target="_blank"
              rel="noopener"
              class="flex w-full items-center gap-3 rounded-xl border border-dark-100 px-4 py-3 text-sm font-medium text-dark-700 transition hover:border-brand-200 hover:bg-dark-50">
              <svg class="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
