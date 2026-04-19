export function useApi() {
  function apiFetch<T>(path: string, options?: Parameters<typeof $fetch>[1]) {
    return $fetch<T>(path, {
      credentials: "include",
      headers: { Accept: "application/json" },
      ...options,
    })
  }

  return { apiFetch }
}
