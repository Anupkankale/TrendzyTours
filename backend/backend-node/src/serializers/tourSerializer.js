import { toDateString } from "../utils/date.js"

/** Mirrors app/Http/Resources/TourItineraryResource.php */
function serializeItineraryDay(day) {
  return {
    day: Number(day.day),
    title: day.title,
    description: day.description,
    meals: day.meals ?? [],
    accommodation: day.accommodation ?? null,
  }
}

/** Mirrors app/Http/Resources/TourResource.php (no envelope, camelCase). */
export function serializeTour(tour) {
  return {
    id: tour._id,
    slug: tour.slug,
    name: tour.name,
    category: tour.category,
    region: tour.region,
    destination: tour.destination,
    duration: Number(tour.duration),
    groupSize: {
      min: Number(tour.groupSizeMin),
      max: Number(tour.groupSizeMax),
    },
    pricePerPerson: Number(tour.pricePerPerson),
    heroImage: tour.heroImage,
    gallery: tour.gallery ?? [],
    shortDescription: tour.shortDescription,
    description: tour.description,
    seoDescription: tour.seoDescription,
    highlights: tour.highlights ?? [],
    inclusions: tour.inclusions ?? [],
    exclusions: tour.exclusions ?? [],
    itinerary: (tour.itinerary ?? []).map(serializeItineraryDay),
    featured: Boolean(tour.featured),
    publishedAt: tour.publishedAt ?? null,
    updatedAt: toDateString(tour.updatedAt),
  }
}

export const serializeTours = (tours) => tours.map(serializeTour)
