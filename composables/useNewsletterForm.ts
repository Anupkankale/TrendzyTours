import { z } from "zod"

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
})

export function useNewsletterForm() {
  const email = ref("")
  const isSubmitting = ref(false)
  const isSuccess = ref(false)
  const error = ref<string | null>(null)

  async function subscribe() {
    const result = schema.safeParse({ email: email.value })
    if (!result.success) {
      error.value = result.error.errors[0]?.message ?? "Invalid email"
      return
    }
    isSubmitting.value = true
    error.value = null
    try {
      await $fetch("/api/newsletter", { method: "POST", body: { email: email.value } })
      isSuccess.value = true
      email.value = ""
    } catch {
      error.value = "Subscription failed. Please try again."
    } finally {
      isSubmitting.value = false
    }
  }

  return { email, isSubmitting, isSuccess, error, subscribe }
}
