import { z } from "zod"
import {
  dateField,
  emailField,
  enumField,
  integerField,
  stringField,
  uuidField,
} from "./fields.js"
import { BOOKING_STATUSES } from "../models/Booking.js"
import { toDateString } from "../utils/date.js"
import * as m from "../utils/messages.js"

// Sources a dashboard user may pick; "website" is reserved for the public site.
const MANUAL_SOURCES = ["call", "reference", "walk-in"]
const CREATABLE_STATUSES = ["pending", "confirmed"]

/** BookingController::store */
export const bookingStoreSchema = z.object({
  tourId: uuidField(),
  customerName: stringField().min(2, m.minChars(2)),
  customerEmail: emailField(),
  customerPhone: stringField().min(10, m.minChars(10)),
  travelDate: dateField().refine(
    (value) => value > toDateString(new Date()),
    m.afterToday(),
  ),
  adults: integerField().refine((n) => n >= 1, m.minValue(1)),
  children: integerField()
    .refine((n) => n >= 0, m.minValue(0))
    .nullish(),
  message: stringField().nullish(),
  source: enumField(MANUAL_SOURCES),
  status: enumField(CREATABLE_STATUSES).nullish(),
})

/** BookingController::update — 'status' => required|in:pending,confirmed,cancelled */
export const bookingUpdateSchema = z.object({
  status: enumField(BOOKING_STATUSES),
})
