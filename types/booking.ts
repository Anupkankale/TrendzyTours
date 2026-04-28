export type BookingStatus = "pending" | "confirmed" | "cancelled"

export interface Booking {
  id: string
  tourId: string
  tourName: string
  tourSlug: string
  customerName: string
  customerEmail: string
  customerPhone: string
  travelDate: string
  adults: number
  children: number
  message: string | null
  status: BookingStatus
  createdAt: string
  updatedAt: string
}
