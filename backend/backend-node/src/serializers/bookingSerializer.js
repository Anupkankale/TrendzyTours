import { toIsoString } from "../utils/date.js"

/**
 * Mirrors app/Http/Resources/BookingResource.php. `tour` may be an unpopulated
 * id or missing entirely — Laravel fell back to "—" / "" in that case.
 */
export function serializeBooking(booking) {
  const tour = booking.tourId && typeof booking.tourId === "object" ? booking.tourId : null

  return {
    id: booking._id,
    tourId: tour ? tour._id : booking.tourId,
    tourName: tour?.name ?? "—",
    tourSlug: tour?.slug ?? "",
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    travelDate: booking.travelDate,
    adults: booking.adults,
    children: booking.children,
    message: booking.message ?? null,
    status: booking.status,
    source: booking.source,
    createdAt: toIsoString(booking.createdAt),
    updatedAt: toIsoString(booking.updatedAt),
  }
}

export const serializeBookings = (bookings) => bookings.map(serializeBooking)
