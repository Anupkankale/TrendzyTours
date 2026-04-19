export type Role = "admin" | "sales" | "customer" | "seo"

export interface User {
  id: string
  email: string
  name: string
  role: Role
  avatarUrl?: string
}

export interface JWTPayload {
  sub: string
  email: string
  name: string
  role: Role
  iat: number
  exp: number
}
