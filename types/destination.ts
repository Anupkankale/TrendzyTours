export interface Region {
  name: string
  slug: string
  image: string
  countryCount: number
  description: string
  featured: string[]
}

export interface Destination {
  name: string
  slug: string
  region: string
  image: string
  tourCount: number
}
