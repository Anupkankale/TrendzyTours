export type BookingStatus = "pending" | "confirmed" | "cancelled"
export type BookingSource = "website" | "call" | "reference" | "walk-in"

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
  source: BookingSource
  createdAt: string
  updatedAt: string
}
