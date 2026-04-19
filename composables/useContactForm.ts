import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  tourInterest: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export type ContactFormValues = z.infer<typeof schema>

export function useContactForm() {
  const isSubmitting = ref(false)
  const isSuccess = ref(false)
  const serverError = ref<string | null>(null)

  const { handleSubmit, errors, defineField, resetForm } = useForm({
    validationSchema: toTypedSchema(schema),
  })

  const [name, nameProps] = defineField("name")
  const [email, emailProps] = defineField("email")
  const [phone, phoneProps] = defineField("phone")
  const [tourInterest, tourInterestProps] = defineField("tourInterest")
  const [message, messageProps] = defineField("message")

  const submit = handleSubmit(async (values) => {
    isSubmitting.value = true
    serverError.value = null
    try {
      await $fetch("/api/contact", { method: "POST", body: values })
      isSuccess.value = true
      resetForm()
    } catch (err: unknown) {
      serverError.value = err instanceof Error ? err.message : "Something went wrong. Please try again."
    } finally {
      isSubmitting.value = false
    }
  })

  return {
    name, nameProps,
    email, emailProps,
    phone, phoneProps,
    tourInterest, tourInterestProps,
    message, messageProps,
    errors,
    isSubmitting,
    isSuccess,
    serverError,
    submit,
  }
}
