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
  const { apiFetch } = useApi()
  const isSubmitting = ref(false)
  const isSuccess = ref(false)
  const serverError = ref<string | null>(null)

  // OTP state
  const otpCode = ref("")
  const otpSending = ref(false)
  const otpSent = ref(false)
  const otpVerifying = ref(false)
  const emailVerified = ref(false)
  const emailToken = ref<string | null>(null)
  const otpError = ref<string | null>(null)
  const otpCooldown = ref(0)

  let cooldownTimer: ReturnType<typeof setInterval> | null = null

  const startCooldown = () => {
    otpCooldown.value = 30
    cooldownTimer = setInterval(() => {
      otpCooldown.value--
      if (otpCooldown.value <= 0 && cooldownTimer) {
        clearInterval(cooldownTimer)
        cooldownTimer = null
      }
    }, 1000)
  }

  const { handleSubmit, errors, defineField, resetForm } = useForm({
    validationSchema: toTypedSchema(schema),
  })

  const [name, nameProps] = defineField("name")
  const [email, emailProps] = defineField("email")
  const [phone, phoneProps] = defineField("phone")
  const [tourInterest, tourInterestProps] = defineField("tourInterest")
  const [message, messageProps] = defineField("message")

  // Reset OTP when email changes
  watch(email, () => {
    if (emailVerified.value) {
      emailVerified.value = false
      emailToken.value = null
      otpSent.value = false
      otpCode.value = ""
      otpError.value = null
    }
  })

  const sendOtp = async () => {
    const emailVal = email.value?.trim()
    if (!emailVal || !emailVal.includes("@")) {
      otpError.value = "Please enter a valid email address first."
      return
    }
    otpSending.value = true
    otpError.value = null
    try {
      await apiFetch("/api/otp/send", { method: "POST", body: { email: emailVal } })
      otpSent.value = true
      startCooldown()
    } catch (err: unknown) {
      otpError.value = err instanceof Error ? err.message : "Failed to send OTP. Please try again."
    } finally {
      otpSending.value = false
    }
  }

  const verifyOtp = async () => {
    if (!otpCode.value || otpCode.value.length !== 6) {
      otpError.value = "Please enter the 6-digit OTP."
      return
    }
    otpVerifying.value = true
    otpError.value = null
    try {
      const res = await apiFetch<{ email_token: string }>("/api/otp/verify", {
        method: "POST",
        body: { email: email.value, otp: otpCode.value },
      })
      emailToken.value = res.email_token
      emailVerified.value = true
    } catch (err: unknown) {
      otpError.value = err instanceof Error ? err.message : "Invalid OTP. Please try again."
    } finally {
      otpVerifying.value = false
    }
  }

  const submit = handleSubmit(async (formValues) => {
    if (!emailVerified.value || !emailToken.value) {
      serverError.value = "Please verify your email address before submitting."
      return
    }
    isSubmitting.value = true
    serverError.value = null
    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: { ...formValues, emailToken: emailToken.value },
      })
      isSuccess.value = true
      resetForm()
      otpCode.value = ""
      otpSent.value = false
      emailVerified.value = false
      emailToken.value = null
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
    // OTP
    otpCode,
    otpSending,
    otpSent,
    otpVerifying,
    emailVerified,
    otpError,
    otpCooldown,
    sendOtp,
    verifyOtp,
  }
}
