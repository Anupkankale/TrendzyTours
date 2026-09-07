import { z } from "zod"
import { emailField, stringField, enumField } from "./fields.js"
import { LEAD_STATUSES } from "../models/Lead.js"
import * as m from "../utils/messages.js"

/** LeadController::store */
export const leadStoreSchema = z.object({
  name: stringField().min(2, m.minChars(2)),
  email: emailField(),
  phone: stringField().min(10, m.minChars(10)),
  tourInterest: stringField().nullish(),
  message: stringField().min(1, m.required()),
})

/** LeadController::update — both fields are `sometimes`. */
export const leadUpdateSchema = z.object({
  status: enumField(LEAD_STATUSES).optional(),
  note: stringField().min(1, m.required()).optional(),
})
