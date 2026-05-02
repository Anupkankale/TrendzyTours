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
  const otpSending = ref(false)
  const otpSent = ref(false)
  const otpStatus = ref<"idle" | "verifying" | "verified" | "wrong">("idle")
  const emailVerified = ref(false)
  const emailToken = ref<string | null>(null)
  const verifyError = ref<string | null>(null)

  const { handleSubmit, errors, defineField, resetForm } = useForm({
    validationSchema: toTypedSchema(schema),
  })

  const [name, nameProps] = defineField("name")
  const [email, emailProps] = defineField("email")
  const [phone, phoneProps] = defineField("phone")
  const [tourInterest, tourInterestProps] = defineField("tourInterest")
  const [message, messageProps] = defineField("message")

  // Reset OTP state when email changes
  watch(email, () => {
    if (emailVerified.value || otpSent.value) {
      emailVerified.value = false
      emailToken.value = null
      otpSent.value = false
      otpStatus.value = "idle"
      verifyError.value = null
    }
  })

  const sendOtp = async () => {
    const emailVal = email.value?.trim()
    if (!emailVal || !emailVal.includes("@")) {
      verifyError.value = "Please enter a valid email address first."
      return
    }
    otpSending.value = true
    otpStatus.value = "idle"
    verifyError.value = null
    try {
      await apiFetch("/api/otp/send", {
        method: "POST",
        body: { email: emailVal },
      })
      otpSent.value = true
    } catch (err: unknown) {
      const status = (err as any)?.response?.status
      if (status === 429) {
        verifyError.value = "Too many requests. Please wait 10 minutes before trying again."
      } else {
        verifyError.value = err instanceof Error ? err.message : "Failed to send OTP. Please try again."
      }
    } finally {
      otpSending.value = false
    }
  }

  const verifyOtp = async (otp: string) => {
    const emailVal = email.value?.trim()
    if (!emailVal || !otp) return
    otpStatus.value = "verifying"
    verifyError.value = null
    try {
      const res = await apiFetch<{ email_token: string }>("/api/otp/verify", {
        method: "POST",
        body: { email: emailVal, otp },
      })
      emailToken.value = res.email_token
      emailVerified.value = true
      otpStatus.value = "verified"
    } catch (err: unknown) {
      otpStatus.value = "wrong"
      const data = (err as any)?.data ?? (err as any)?.response?._data
      const msg = data?.message ?? (err instanceof Error ? err.message : "Invalid OTP. Please try again.")
      verifyError.value = msg
      if (msg?.toLowerCase().includes("expired")) {
        setTimeout(() => {
          otpSent.value = false
          otpStatus.value = "idle"
          verifyError.value = "OTP expired. Please request a new one."
        }, 1500)
      }
    }
  }

  const resetOtpStatus = () => {
    otpStatus.value = "idle"
    verifyError.value = null
  }

  const resendOtp = async () => {
    otpSent.value = false
    otpStatus.value = "idle"
    verifyError.value = null
    await sendOtp()
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
      otpSent.value = false
      otpStatus.value = "idle"
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
    otpSending,
    otpSent,
    otpStatus,
    emailVerified,
    verifyError,
    sendOtp,
    verifyOtp,
    resetOtpStatus,
    resendOtp,
    submit,
  }
}