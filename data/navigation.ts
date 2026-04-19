export interface NavChild {
  label: string
  href: string
  description?: string
}

export interface NavItem {
  label: string
  href?: string
  children?: NavChild[]
}

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  {
    label: "Holidays",
    children: [
      { label: "Domestic", href: "/holidays/domestic", description: "Explore India's best destinations" },
      {
        label: "World Travellers",
        href: "/holidays/world-travellers",
        description: "International packages for every budget",
      },
      { label: "Cruise Tours", href: "/holidays/cruise-tours", description: "Luxury and river cruise experiences" },
      { label: "Ladies Only Tours", href: "/holidays/ladies-only", description: "Safe, curated travel for women" },
    ],
  },
  {
    label: "Destinations",
    children: [
      { label: "Asia", href: "/destinations/asia", description: "From spiritual Bali to royal Rajasthan" },
      { label: "Europe", href: "/destinations/europe", description: "Timeless cities, alpine scenery and coastal magic" },
      { label: "Africa", href: "/destinations/africa", description: "Wildlife safaris and ancient wonders" },
      { label: "Oceania", href: "/destinations/oceania", description: "Australia, New Zealand and Pacific islands" },
      { label: "Latin America", href: "/destinations/latin-america", description: "Rainforests, ruins and vibrant culture" },
      { label: "North America", href: "/destinations/north-america", description: "Road trips, national parks and city escapes" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
]
