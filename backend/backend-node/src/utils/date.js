/**
 * The Laravel app ran in UTC — config/app.php pins `'timezone' => 'UTC'`, so
 * the APP_TIMEZONE=Asia/Kolkata line in .env was never applied — and MySQL
 * therefore held UTC wall-clock timestamps. Formatting in UTC here keeps every
 * rendered date identical after the cutover.
 */
const UTC_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "UTC",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

/** Date -> "YYYY-MM-DD" (UTC), or null. Passes through strings untouched. */
export function toDateString(value) {
  if (value === null || value === undefined) return null
  if (typeof value === "string") return value.slice(0, 10)
  return UTC_DATE.format(value)
}

/**
 * Date -> ISO-8601 UTC, or null.
 *
 * Carbon's toISOString() emitted six fractional digits and the MySQL columns
 * carried no sub-second precision, so those digits were always zeros. Padding
 * JavaScript's three to six reproduces the exact string the frontend used to
 * receive.
 */
export function toIsoString(value) {
  if (value === null || value === undefined) return null
  return new Date(value).toISOString().replace(/\.(\d{3})Z$/, ".$1000Z")
}

/** Normalise any accepted date input to the stored "YYYY-MM-DD" form. */
export function normalizeDateInput(value) {
  if (value === null || value === undefined || value === "") return null
  if (typeof value === "string") return value.slice(0, 10)
  return UTC_DATE.format(new Date(value))
}
