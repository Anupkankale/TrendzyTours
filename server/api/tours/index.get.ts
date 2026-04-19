import { tours } from "@/data/tours"
import type { TourCategory } from "@/types/tour"

export default defineEventHandler((event) => {
  const query = getQuery(event)
  let result = [...tours]

  if (query.category) result = result.filter((t) => t.category === (query.category as TourCategory))
  if (query.region) result = result.filter((t) => t.region === query.region)
  if (query.featured === "true") result = result.filter((t) => t.featured)

  return result
})
