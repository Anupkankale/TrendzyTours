import { z } from "zod"
import {
  arrayField,
  booleanField,
  dateField,
  enumField,
  integerField,
  requiredString,
  stringField,
} from "./fields.js"
import { TOUR_CATEGORIES } from "../models/Tour.js"
import * as m from "../utils/messages.js"

const boundedString = (max) => requiredString().max(max, m.maxChars(max))

const itineraryDaySchema = z.object({
  day: integerField().refine((n) => n >= 1, m.minValue(1)),
  title: boundedString(255),
  description: requiredString(),
  meals: arrayField(stringField().max(255, m.maxChars(255))),
  accommodation: stringField().max(255, m.maxChars(255)).nullish(),
})

const groupSizeShape = z.object({
  min: integerField().refine((n) => n >= 1, m.minValue(1)),
  max: integerField().refine((n) => n >= 1, m.minValue(1)),
})

/**
 * Hand-rolled so the failure modes match Laravel's, which validated
 * `groupSize`, `groupSize.min` and `groupSize.max` as three separate rules:
 * a missing object reports all three as required, and `gte:groupSize.min`
 * renders the other field's *value*, not its name.
 */
const groupSizeSchema = z
  .any()
  .superRefine((value, ctx) => {
    if (value === undefined || value === null) {
      for (const path of [[], ["min"], ["max"]]) {
        ctx.addIssue({ code: "custom", message: m.required(), path })
      }
      return
    }

    const result = groupSizeShape.safeParse(value)
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({ code: "custom", message: issue.message, path: issue.path })
      }
      return
    }

    if (result.data.max < result.data.min) {
      ctx.addIssue({ code: "custom", message: m.gteValue(result.data.min), path: ["max"] })
    }
  })
  .transform((value) => groupSizeShape.parse(value))

/**
 * TourController::validateTour(). On create every attribute is `required`; on
 * update each is `sometimes`, so an absent key is simply left untouched — which
 * is exactly what `.optional()` plus zod's key-stripping gives us.
 */
function tourFields() {
  return {
    name: boundedString(255),
    slug: boundedString(255),
    category: enumField(TOUR_CATEGORIES),
    region: boundedString(255),
    destination: boundedString(255),
    duration: integerField().refine((n) => n >= 1, m.minValue(1)),
    groupSize: groupSizeSchema,
    pricePerPerson: integerField().refine((n) => n >= 0, m.minValue(0)),
    heroImage: boundedString(2048),
    gallery: arrayField(stringField().max(2048, m.maxChars(2048))).min(1, m.minItems(1)),
    shortDescription: requiredString(),
    description: requiredString(),
    seoDescription: requiredString(),
    highlights: arrayField(stringField().max(255, m.maxChars(255))).min(1, m.minItems(1)),
    inclusions: arrayField(stringField().max(255, m.maxChars(255))).min(1, m.minItems(1)),
    exclusions: arrayField(stringField().max(255, m.maxChars(255))).min(1, m.minItems(1)),
    itinerary: arrayField(itineraryDaySchema).min(1, m.minItems(1)),
  }
}

// `featured` and `publishedAt` are optional in both directions.
const optionalFields = {
  featured: booleanField().optional(),
  publishedAt: dateField().nullish(),
}

export const tourStoreSchema = z.object({ ...tourFields(), ...optionalFields })

export const tourUpdateSchema = z.object({
  ...Object.fromEntries(Object.entries(tourFields()).map(([key, schema]) => [key, schema.optional()])),
  ...optionalFields,
})
