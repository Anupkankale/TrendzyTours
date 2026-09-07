import { Booking } from "../models/Booking.js"
import { Tour } from "../models/Tour.js"
import { serializeBooking, serializeBookings } from "../serializers/bookingSerializer.js"
import { notFound, unprocessable } from "../utils/ApiError.js"
import { doesNotExist } from "../utils/messages.js"

const TOUR_FIELDS = "name slug"

/** GET /api/bookings */
export async function index(_req, res) {
  const bookings = await Booking.find().populate("tourId", TOUR_FIELDS).sort({ createdAt: -1 })
  res.json(serializeBookings(bookings))
}

/** POST /api/bookings — the dashboard's manual booking entry. */
export async function store(req, res) {
  const data = req.validated

  // Port of the `exists:tours,id` rule.
  if (!(await Tour.exists({ _id: data.tourId }))) {
    throw unprocessable(doesNotExist("tourId"), { tourId: [doesNotExist("tourId")] })
  }

  const booking = await Booking.create({
    tourId: data.tourId,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    travelDate: data.travelDate,
    adults: data.adults,
    children: data.children ?? 0,
    message: data.message ?? null,
    source: data.source,
    status: data.status ?? "pending",
  })

  await booking.populate("tourId", TOUR_FIELDS)

  // Laravel's JsonResource answers 201 for a freshly created model.
  res.status(201).json(serializeBooking(booking))
}

/** GET /api/bookings/:id */
export async function show(req, res, next) {
  const booking = await Booking.findById(req.params.id).populate("tourId", TOUR_FIELDS)
  if (!booking) return next(notFound())

  res.json(serializeBooking(booking))
}

/** PUT /api/bookings/:id — status only. */
export async function update(req, res, next) {
  const booking = await Booking.findById(req.params.id)
  if (!booking) return next(notFound())

  booking.status = req.validated.status
  await booking.save()

  await booking.populate("tourId", TOUR_FIELDS)

  res.json(serializeBooking(booking))
}
