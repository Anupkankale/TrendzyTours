import { z } from "zod"
import { emailField, stringField } from "./fields.js"
import * as m from "../utils/messages.js"

const contactFields = {
  name: stringField().min(2, m.minChars(2)),
  email: emailField(),
  phone: stringField().min(10, m.minChars(10)),
  emailToken: stringField().min(1, m.required()),
  tourInterest: stringField().nullish(),
  message: stringField().min(10, m.minChars(10)),
}

/** ContactController::store — the Laravel rules, emailToken required. */
export const contactSchema = z.object(contactFields)

/**
 * Used when OTP_REQUIRED=false. The field is still accepted, so a frontend
 * that goes through the OTP flow anyway keeps working unchanged; it just is
 * no longer demanded.
 */
export const contactSchemaWithoutOtp = z.object({
  ...contactFields,
  emailToken: stringField().nullish(),
})

/** NewsletterController::subscribe */
export const newsletterSchema = z.object({
  email: emailField(),
})
