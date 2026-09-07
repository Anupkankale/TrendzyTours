import { Tour } from "../models/Tour.js"
import { Booking } from "../models/Booking.js"
import { serializeTour, serializeTours } from "../serializers/tourSerializer.js"
import { notFound, unprocessable } from "../utils/ApiError.js"
import { notUnique } from "../utils/messages.js"

/** Laravel's `filled()`: present and not an empty string. */
const filled = (value) => value !== undefined && value !== null && value !== ""

/** PHP's FILTER_VALIDATE_BOOLEAN. */
const toBool = (value) => ["1", "true", "on", "yes"].includes(String(value).toLowerCase())

/**
 * Maps the validated camelCase payload onto model fields, only for keys that
 * were actually sent — the port of TourController::mapTourAttributes().
 */
function mapTourAttributes(data) {
  const attributes = {}
  const copy = [
    "name",
    "slug",
    "category",
    "region",
    "destination",
    "duration",
    "pricePerPerson",
    "heroImage",
    "shortDescription",
    "description",
    "seoDescription",
    "highlights",
    "inclusions",
    "exclusions",
    "featured",
    "publishedAt",
  ]

  for (const key of copy) {
    if (key in data) attributes[key] = data[key]
  }

  if ("groupSize" in data) {
    attributes.groupSizeMin = data.groupSize.min
    attributes.groupSizeMax = data.groupSize.max
  }

  // Embedded arrays replace the old syncGallery()/syncItinerary() child-table
  // wipe-and-recreate; assignment is the whole operation.
  if ("gallery" in data) attributes.gallery = data.gallery
  if ("itinerary" in data) {
    attributes.itinerary = data.itinerary.map((day) => ({
      day: day.day,
      title: day.title,
      description: day.description,
      meals: day.meals,
      accommodation: day.accommodation ?? null,
    }))
  }

  return attributes
}

/** Port of Rule::unique('tours','slug')->ignore($tour?->id). */
async function assertSlugIsUnique(slug, ignoreId = null) {
  if (slug === undefined) return

  const query = { slug }
  if (ignoreId) query._id = { $ne: ignoreId }

  if (await Tour.exists(query)) {
    throw unprocessable(notUnique("slug"), { slug: [notUnique("slug")] })
  }
}

/** GET /api/tours — public, published only. */
export async function index(req, res) {
  const query = { publishedAt: { $ne: null } }

  if (filled(req.query.category)) query.category = req.query.category
  if (filled(req.query.region)) query.region = req.query.region
  if (filled(req.query.featured)) query.featured = toBool(req.query.featured)

  // MySQL returned these in clustered (uuid) order; sorting by creation then id
  // reproduces it deterministically.
  const tours = await Tour.find(query).sort({ createdAt: 1, _id: 1 })

  res.json(serializeTours(tours))
}

/** GET /api/tours/:slug — public, published only. */
export async function show(req, res, next) {
  const tour = await Tour.findOne({ slug: req.params.slug, publishedAt: { $ne: null } })
  if (!tour) return next(notFound())

  res.json(serializeTour(tour))
}

/** GET /api/admin/tours */
export async function adminIndex(_req, res) {
  // `_id` breaks ties the way MySQL's clustered index did for `latest('updated_at')`.
  const tours = await Tour.find().sort({ updatedAt: -1, _id: 1 })
  res.json(serializeTours(tours))
}

/** GET /api/admin/tours/:id */
export async function adminShow(req, res, next) {
  const tour = await Tour.findById(req.params.id)
  if (!tour) return next(notFound())

  res.json(serializeTour(tour))
}

/** POST /api/admin/tours */
export async function store(req, res) {
  await assertSlugIsUnique(req.validated.slug)

  const tour = await Tour.create(mapTourAttributes(req.validated))

  // Laravel's JsonResource answers 201 for a freshly created model.
  res.status(201).json(serializeTour(tour))
}

/** PUT /api/admin/tours/:id */
export async function update(req, res, next) {
  const tour = await Tour.findById(req.params.id)
  if (!tour) return next(notFound())

  await assertSlugIsUnique(req.validated.slug, tour._id)

  tour.set(mapTourAttributes(req.validated))
  await tour.save()

  res.json(serializeTour(tour))
}

/** DELETE /api/admin/tours/:id */
export async function destroy(req, res, next) {
  const tour = await Tour.findById(req.params.id)
  if (!tour) return next(notFound())

  if (await Booking.exists({ tourId: tour._id })) {
    return next(unprocessable("This tour has existing bookings and cannot be deleted."))
  }

  await tour.deleteOne()

  res.json({ ok: true })
}
