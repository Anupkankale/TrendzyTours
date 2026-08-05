import { serverQueryContent } from "#content/server"
import { tours as fallbackTours } from "@/data/tours"
import { regions } from "@/data/destinations"
import type { Tour } from "@/types/tour"

/**
 * Dynamic URL source for @nuxtjs/sitemap.
 *
 * Deliberately NOT under /api — nitro.devProxy forwards every /api/** request
 * to the Laravel backend, which would shadow this route in development.
 *
 * Tours come from the live API when reachable so dashboard-published tours get
 * indexed; the static seed in data/tours.ts is the fallback so a backend outage
 * degrades the sitemap instead of emptying it.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = (config.public.apiBase as string) || "http://localhost:8888"

  let tours: Tour[] = []
  try {
    tours = await $fetch<Tour[]>("/api/tours", {
      baseURL: apiBase,
      headers: { Accept: "application/json" },
      timeout: 5000,
    })
  }
  catch {
    tours = fallbackTours.filter((tour) => tour.publishedAt)
  }
  if (!tours.length) tours = fallbackTours.filter((tour) => tour.publishedAt)

  const tourUrls = tours.map((tour) => ({
    loc: `/tours/${tour.slug}`,
    lastmod: tour.updatedAt || tour.publishedAt || undefined,
    changefreq: "weekly",
    priority: tour.featured ? 0.9 : 0.8,
  }))

  const regionUrls = regions.map((region) => ({
    loc: `/destinations/${region.slug}`,
    changefreq: "monthly",
    priority: 0.7,
  }))

  let postUrls: { loc: string; lastmod?: string; changefreq: string; priority: number }[] = []
  try {
    const posts = await serverQueryContent(event, "blog").find()
    postUrls = posts
      .filter((post) => post._path)
      .map((post) => ({
        loc: post._path as string,
        lastmod: (post.publishedAt as string) || undefined,
        changefreq: "monthly",
        priority: 0.6,
      }))
  }
  catch {
    postUrls = []
  }

  return [...tourUrls, ...regionUrls, ...postUrls]
})
