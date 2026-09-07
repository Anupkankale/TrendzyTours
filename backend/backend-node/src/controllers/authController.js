import bcrypt from "bcryptjs"
import { User } from "../models/User.js"
import { serializeUser } from "../serializers/userSerializer.js"
import { issueToken, setAuthCookie, clearAuthCookie } from "../services/cookieService.js"
import { unauthorized } from "../utils/ApiError.js"

/** POST /api/auth/login */
export async function login(req, res, next) {
  const { email, password } = req.validated

  // `password` is `select: false` on the schema, so ask for it explicitly.
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password")

  // bcryptjs verifies Laravel's $2y$ hashes unchanged, so existing passwords
  // keep working after the cutover.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(unauthorized("Invalid email or password"))
  }

  setAuthCookie(res, issueToken(user))

  res.json({ user: serializeUser(user) })
}

/** POST /api/auth/logout */
export async function logout(_req, res) {
  clearAuthCookie(res)
  res.json({ success: true })
}

/** GET /api/auth/me */
export async function me(req, res) {
  res.json({ user: serializeUser(req.user) })
}
