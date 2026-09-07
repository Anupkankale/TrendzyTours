/**
 * Reads a JSON response on stdin and prints it with keys sorted, so two
 * backends can be diffed textually.
 *
 * Arguments:
 *   <key>            blank this field out — it legitimately differs between
 *                    two independently seeded databases (generated ids,
 *                    timestamps)
 *   --sort-by=<key>  sort top-level arrays by that field, for endpoints whose
 *                    row order is genuinely unspecified
 */
const args = process.argv.slice(2)
const sortKey = args.find((arg) => arg.startsWith("--sort-by="))?.split("=")[1]
const volatileKeys = new Set(args.filter((arg) => !arg.startsWith("--")))

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize)

  if (value && typeof value === "object") {
    const out = {}
    for (const key of Object.keys(value).sort()) {
      out[key] = volatileKeys.has(key) ? "<volatile>" : normalize(value[key])
    }
    return out
  }

  return value
}

let raw = ""
process.stdin.on("data", (chunk) => (raw += chunk))
process.stdin.on("end", () => {
  try {
    let parsed = JSON.parse(raw)
    if (sortKey && Array.isArray(parsed)) {
      parsed = [...parsed].sort((a, b) =>
        String(a?.[sortKey]).localeCompare(String(b?.[sortKey])),
      )
    }
    console.log(JSON.stringify(normalize(parsed), null, 2))
  } catch {
    console.log(raw.trim())
  }
})
