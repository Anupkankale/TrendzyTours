import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { z } from "zod"
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth"

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

  // Email verification state
  const linkSending = ref(false)
  const linkSent = ref(false)
  const emailVerified = ref(false)
  const emailToken = ref<string | null>(null)
  const verifyError = ref<string | null>(null)

  const { handleSubmit, errors, defineField, resetForm, setFieldValue } = useForm({
    validationSchema: toTypedSchema(schema),
  })

  const [name, nameProps] = defineField("name")
  const [email, emailProps] = defineField("email")
  const [phone, phoneProps] = defineField("phone")
  const [tourInterest, tourInterestProps] = defineField("tourInterest")
  const [message, messageProps] = defineField("message")

  // Reset verification when email changes
  watch(email, () => {
    if (emailVerified.value) {
      emailVerified.value = false
      emailToken.value = null
      linkSent.value = false
      verifyError.value = null
    }
  })

  // On mount — check if returning from Firebase email link
  onMounted(async () => {
    const { $firebaseAuth } = useNuxtApp()
    const currentUrl = window.location.href

    if (isSignInWithEmailLink($firebaseAuth as any, currentUrl)) {
      const savedEmail = localStorage.getItem("emailForSignIn")
      if (!savedEmail) {
        verifyError.value = "Could not verify email. Please try again."
        return
      }
      try {
        const result = await signInWithEmailLink($firebaseAuth as any, savedEmail, currentUrl)
        const token = await (result.user as any).getIdToken()
        emailToken.value = token
        emailVerified.value = true
        setFieldValue("email", savedEmail)
        localStorage.removeItem("emailForSignIn")
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch {
        verifyError.value = "Verification link is invalid or expired. Please request a new one."
      }
    }
  })

  const sendVerificationLink = async () => {
    const { $firebaseAuth } = useNuxtApp()
    const emailVal = email.value?.trim()

    if (!emailVal || !emailVal.includes("@")) {
      verifyError.value = "Please enter a valid email address first."
      return
    }
    linkSending.value = true
    verifyError.value = null
    try {
      await sendSignInLinkToEmail($firebaseAuth as any, emailVal, {
        url: `${window.location.origin}/contact`,
        handleCodeInApp: true,
      })
      localStorage.setItem("emailForSignIn", emailVal)
      linkSent.value = true
    } catch (err: unknown) {
      const code = (err as any)?.code ?? ""
      if (code === "auth/operation-not-allowed" || code === "auth/configuration-not-found") {
        verifyError.value = "Email link sign-in is not enabled. Go to Firebase Console → Authentication → Sign-in method → Email/Password → enable Email link."
      } else if (code === "auth/invalid-continue-uri" || code === "auth/unauthorized-continue-uri") {
        verifyError.value = "This domain is not authorised in Firebase. Add it under Authentication → Settings → Authorized domains."
      } else {
        verifyError.value = err instanceof Error ? err.message : "Failed to send verification link."
      }
    } finally {
      linkSending.value = false
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
      linkSent.value = false
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
    linkSending,
    linkSent,
    emailVerified,
    verifyError,
    sendVerificationLink,
    submit,
  }
}
