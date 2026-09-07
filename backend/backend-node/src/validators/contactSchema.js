import { z } from "zod"
import { emailField, stringField } from "./fields.js"
import * as m from "../utils/messages.js"

const contactFields = {
  name: stringField().min(2, m.minChars(2)),
  email: emailField(),
  phone: stringField().min(10, m.minChars(10)),
  tourInterest: stringField().nullish(),
  message: stringField().min(10, m.minChars(10)),
}

/** ContactController::store */
export const contactSchema = z.object(contactFields)

/** NewsletterController::subscribe */
export const newsletterSchema = z.object({
  email: emailField(),
})
