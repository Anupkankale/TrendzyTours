import { tours } from "@/data/tours"

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, "slug")
  const tour = tours.find((t) => t.slug === slug)
  if (!tour) throw createError({ statusCode: 404, statusMessage: "Tour not found" })
  return tour
})
