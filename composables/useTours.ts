import type { Tour } from "@/types/tour"

export function useTours() {
  const { data: tours, pending, error } = useAsyncData<Tour[]>("tours", () => $fetch("/api/tours"))
  return { tours, pending, error }
}

export function useTour(slug: string) {
  const { data: tour, pending, error } = useAsyncData<Tour>(`tour-${slug}`, () => $fetch(`/api/tours/${slug}`))
  return { tour, pending, error }
}
