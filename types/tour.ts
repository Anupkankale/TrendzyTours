export type TourCategory = "domestic" | "world-travellers" | "cruise" | "ladies-only"

export interface TourItineraryDay {
  day: number
  title: string
  description: string
  meals: string[]
  accommodation?: string
}

export interface Tour {
  id: string
  slug: string
  name: string
  category: TourCategory
  region: string
  destination: string
  duration: number
  groupSize: { min: number; max: number }
  pricePerPerson: number
  heroImage: string
  gallery: string[]
  shortDescription: string
  description: string
  seoDescription: string
  highlights: string[]
  inclusions: string[]
  exclusions: string[]
  itinerary: TourItineraryDay[]
  featured: boolean
  publishedAt: string
  updatedAt: string
}
