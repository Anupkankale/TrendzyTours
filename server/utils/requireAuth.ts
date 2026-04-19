import type { H3Event } from "h3"
import { verifyJWT } from "./jwt"
import type { JWTPayload } from "@/types/auth"

export async function requireAuth(event: H3Event, allowedRoles?: string[]): Promise<JWTPayload> {
  const token = getCookie(event, "auth_token")
  if (!token) throw createError({ statusCode: 401, statusMessage: "Unauthorized" })

  let payload: JWTPayload
  try {
    payload = await verifyJWT(token)
  } catch {
    throw createError({ statusCode: 401, statusMessage: "Invalid token" })
  }

  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" })
  }

  return payload
}
