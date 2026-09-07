import request from "supertest"
import { createApp } from "../../src/app.js"
import { USERS } from "./factories.js"

export const app = createApp()

/** Plaintext passwords behind the bcrypt hashes in factories.js. */
export const PASSWORDS = {
  admin: "admin123",
  sales: "sales123",
  seo: "admin123",
}

/** A supertest agent that keeps the auth_token cookie, like a browser. */
export async function loginAs(role) {
  const agent = request.agent(app)

  await agent
    .post("/api/auth/login")
    .send({ email: USERS[role].email, password: PASSWORDS[role] })
    .expect(200)

  return agent
}

export { request }
