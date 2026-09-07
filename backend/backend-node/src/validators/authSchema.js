import { z } from "zod"
import { emailField, stringField } from "./fields.js"
import * as m from "../utils/messages.js"

/** AuthController::login — 'email' => required|email, 'password' => required|min:6 */
export const loginSchema = z.object({
  email: emailField(),
  password: stringField().min(6, m.minChars(6)),
})
