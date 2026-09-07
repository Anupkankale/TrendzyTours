/**
 * Laravel's default validation wording, so error strings the frontend surfaces
 * read exactly as they did before the port.
 *
 * Messages carry a `:attribute` placeholder (and `:other` where a rule names a
 * second field). `zodErrorToApiError` substitutes the real, humanised path at
 * the moment the response is built, which is how Laravel gets indices like
 * `itinerary.0.title` into the text.
 */
const A = ":attribute"

/** Str::snake() + '_' -> ' ': `pricePerPerson` -> "price per person". */
export function humanizeAttribute(path) {
  return path
    .replace(/([a-z\d])([A-Z])/g, "$1_$2")
    .replace(/_/g, " ")
    .toLowerCase()
}

export const required = () => `The ${A} field is required.`
export const mustBeString = () => `The ${A} field must be a string.`
export const mustBeEmail = () => `The ${A} field must be a valid email address.`
export const minChars = (n) => `The ${A} field must be at least ${n} characters.`
export const maxChars = (n) => `The ${A} field must not be greater than ${n} characters.`
export const minValue = (n) => `The ${A} field must be at least ${n}.`
export const minItems = (n) => `The ${A} field must have at least ${n} items.`
export const mustBeInteger = () => `The ${A} field must be an integer.`
export const mustBeArray = () => `The ${A} field must be an array.`
export const mustBeBoolean = () => `The ${A} field must be true or false.`
export const mustBeDate = () => `The ${A} field must be a valid date.`
export const afterToday = () => `The ${A} field must be a date after today.`
export const mustBeUuid = () => `The ${A} field must be a valid UUID.`
export const invalidChoice = () => `The selected ${A} is invalid.`
export const exactChars = (n) => `The ${A} field must be ${n} characters.`
/** Laravel's `gte:otherField` substitutes the other field's *value*. */
export const gteValue = (value) => `The ${A} field must be greater than or equal to ${value}.`

/**
 * `unique` and `exists` are checked in controllers, where the attribute is
 * known up front, so these take the name directly.
 */
export const notUnique = (field) => `The ${humanizeAttribute(field)} has already been taken.`
export const doesNotExist = (field) => `The selected ${humanizeAttribute(field)} is invalid.`
