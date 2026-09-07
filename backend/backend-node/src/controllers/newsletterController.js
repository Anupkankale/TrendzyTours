import { subscribeToNewsletter } from "../services/brevoService.js"

/** POST /api/newsletter — always reports success, exactly as Laravel did. */
export async function subscribe(req, res) {
  await subscribeToNewsletter(req.validated.email)
  res.json({ success: true })
}
