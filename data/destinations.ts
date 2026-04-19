export interface Region {
  name: string
  slug: string
  image: string
  countryCount: number
  description: string
  featured: string[]
}

export const regions: Region[] = [
  {
    name: "Asia",
    slug: "asia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=85&auto=format&fit=crop",
    countryCount: 18,
    description: "From spiritual Bali to royal Rajasthan",
    featured: ["Bali", "Thailand", "Japan", "Bhutan", "India", "Dubai"],
  },
  {
    name: "Europe",
    slug: "europe",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=85&auto=format&fit=crop",
    countryCount: 24,
    description: "Timeless cities, alpine scenery and coastal magic",
    featured: ["France", "Italy", "Switzerland", "Greece", "Spain", "Netherlands"],
  },
  {
    name: "Africa",
    slug: "africa",
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=85&auto=format&fit=crop",
    countryCount: 12,
    description: "Wildlife safaris and stunning landscapes",
    featured: ["Kenya", "Tanzania", "South Africa", "Egypt", "Morocco", "Zanzibar"],
  },
  {
    name: "Oceania",
    slug: "oceania",
    image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=85&auto=format&fit=crop",
    countryCount: 6,
    description: "Australia, New Zealand and Pacific island paradises",
    featured: ["Australia", "New Zealand", "Fiji", "Maldives"],
  },
  {
    name: "Latin America",
    slug: "latin-america",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=85&auto=format&fit=crop",
    countryCount: 10,
    description: "Ancient ruins, rainforests and vibrant cultures",
    featured: ["Peru", "Brazil", "Argentina", "Colombia", "Costa Rica", "Cuba"],
  },
  {
    name: "North America",
    slug: "north-america",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=85&auto=format&fit=crop",
    countryCount: 4,
    description: "National parks, cities and coastal wonders",
    featured: ["USA", "Canada", "Mexico", "Caribbean"],
  },
]
