import { z } from "zod"
import { emailField, stringField } from "./fields.js"
import * as m from "../utils/messages.js"

/** OtpController::send */
export const otpSendSchema = z.object({
  email: emailField(),
})

/** OtpController::verify — 'otp' => required|string|size:6 */
export const otpVerifySchema = z.object({
  email: emailField(),
  otp: stringField().length(6, m.exactChars(6)),
})
