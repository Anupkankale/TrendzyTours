import { defineStore } from "pinia"
import type { Booking, BookingSource, BookingStatus } from "@/types/booking"

interface TourOption { id: string; name: string; destination: string; pricePerPerson: number }

export const useBookingsStore = defineStore("bookings", () => {
  const { apiFetch } = useApi()
  const bookings = ref<Booking[]>([])
  const tourOptions = ref<TourOption[]>([])
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

  async function fetchTourOptions() {
    if (tourOptions.value.length) return
    try {
      const tours = await apiFetch<TourOption[]>("/api/tours")
      tourOptions.value = tours
    } catch {}
  }

  async function createBooking(data: {
    tourId: string
    customerName: string
    customerEmail: string
    customerPhone: string
    travelDate: string
    adults: number
    children: number
    message: string
    source: BookingSource
    status: BookingStatus
  }): Promise<Booking> {
    const booking = await apiFetch<Booking>("/api/bookings", { method: "POST", body: data })
    bookings.value.unshift(booking)
    return booking
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

  return { bookings, tourOptions, loading, error, statusCounts, fetchBookings, fetchTourOptions, fetchBooking, updateStatus, createBooking }
})
