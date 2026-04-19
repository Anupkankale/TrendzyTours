import { verifyJWT } from "@/server/utils/jwt"

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "auth_token")
  if (!token) throw createError({ statusCode: 401, statusMessage: "Not authenticated" })

  try {
    const payload = await verifyJWT(token)
    return { user: { id: payload.sub, email: payload.email, role: payload.role } }
  } catch {
    throw createError({ statusCode: 401, statusMessage: "Invalid token" })
  }
})
