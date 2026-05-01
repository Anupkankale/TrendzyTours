export function useApi() {
  const config = useRuntimeConfig()

  function apiFetch<T>(path: string, options?: Parameters<typeof $fetch>[1]) {
    return $fetch<T>(path, {
      baseURL: process.server ? config.public.apiBase : undefined,
      credentials: "include",
      headers: { Accept: "application/json" },
      ...options,
    })
  }

  return { apiFetch }
}
