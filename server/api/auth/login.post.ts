import { z } from "zod"
import { signJWT } from "@/server/utils/jwt"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Placeholder — replace with real DB lookup in production
const DEMO_USERS = [
  { id: "1", email: "admin@trendzytours.com", password: "admin123", name: "Admin User", role: "admin" as const },
  { id: "2", email: "sales@trendzytours.com", password: "sales123", name: "Sales Manager", role: "sales" as const },
  { id: "3", email: "seo@trendzytours.com", password: "seo12345", name: "SEO Manager", role: "seo" as const },
]

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) throw createError({ statusCode: 400, statusMessage: "Invalid credentials" })

  const user = DEMO_USERS.find((u) => u.email === result.data.email && u.password === result.data.password)
  if (!user) throw createError({ statusCode: 401, statusMessage: "Invalid email or password" })

  const token = await signJWT({ sub: user.id, email: user.email, name: user.name, role: user.role })

  setCookie(event, "auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  const { password: _pw, ...safeUser } = user
  return { user: safeUser }
})
