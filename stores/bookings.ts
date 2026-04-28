import { defineStore } from "pinia"
import type { Booking, BookingStatus } from "@/types/booking"

export const useBookingsStore = defineStore("bookings", () => {
  const { apiFetch } = useApi()
  const bookings = ref<Booking[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBookings() {
    loading.value = true
    error.value = null
    try {
      bookings.value = await apiFetch<Booking[]>("/api/bookings")
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load bookings"
    } finally {
      loading.value = false
    }
  }

  async function fetchBooking(id: string): Promise<Booking | null> {
    try {
      return await apiFetch<Booking>(`/api/bookings/${id}`)
    } catch {
      return null
    }
  }

  async function updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const booking = await apiFetch<Booking>(`/api/bookings/${id}`, {
      method: "PUT",
      body: { status },
    })
    const idx = bookings.value.findIndex((b) => b.id === id)
    if (idx >= 0) bookings.value[idx] = booking
    return booking
  }

  const statusCounts = computed(() => {
    const counts: Record<string, number> = { pending: 0, confirmed: 0, cancelled: 0 }
    for (const b of bookings.value) counts[b.status] = (counts[b.status] ?? 0) + 1
    return counts
  })

  return { bookings, loading, error, statusCounts, fetchBookings, fetchBooking, updateStatus }
})
