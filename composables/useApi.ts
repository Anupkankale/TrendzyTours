 export function useApi() {
  const config = useRuntimeConfig()

  function apiFetch<T>(path: string, options?: Parameters<typeof $fetch>[1]) {
    return $fetch<T>(path, {
      baseURL: config.public.apiBase, // ← remove process.server check
      credentials: "include",
      headers: { Accept: "application/json" },
      ...options,
    })
  }

  return { apiFetch }
}