import type { Tour } from "@/types/tour"

export function useTours() {
  const { apiFetch } = useApi()
  const { data: tours, pending, error } = useAsyncData<Tour[]>("tours", () => apiFetch("/api/tours"))
  return { tours, pending, error }
}

export function useTour(slug: string) {
  const { apiFetch } = useApi()
  const { data: tour, pending, error } = useAsyncData<Tour>(`tour-${slug}`, () => apiFetch(`/api/tours/${slug}`))
  return { tour, pending, error }
}
