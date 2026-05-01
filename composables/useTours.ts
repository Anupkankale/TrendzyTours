import type { Tour } from "@/types/tour"

interface UseToursOptions {
  category?: string
  region?: string
  featured?: boolean
  key?: string
}

export function useTours(options: UseToursOptions = {}) {
  const { apiFetch } = useApi()
  const query = {
    ...(options.category ? { category: options.category } : {}),
    ...(options.region ? { region: options.region } : {}),
    ...(typeof options.featured === "boolean" ? { featured: String(options.featured) } : {}),
  }

  const key = options.key ?? ["tours", options.category ?? "all", options.region ?? "all", String(options.featured ?? "all")].join(":")
  const { data: tours, pending, error } = useAsyncData<Tour[]>(key, () => apiFetch("/api/tours", { query }))
  return { tours, pending, error }
}

export function useTour(slug: string) {
  const { apiFetch } = useApi()
  const { data: tour, pending, error } = useAsyncData<Tour>(`tour-${slug}`, () => apiFetch(`/api/tours/${slug}`))
  return { tour, pending, error }
}
