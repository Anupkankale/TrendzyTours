import { z } from "zod"

const schema = z.object({ email: z.string().email() })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) throw createError({ statusCode: 400, statusMessage: "Invalid email" })

  const config = useRuntimeConfig()

  if (config.brevoApiKey && config.brevoListId) {
    await $fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "api-key": config.brevoApiKey, "Content-Type": "application/json" },
      body: {
        email: result.data.email,
        listIds: [Number(config.brevoListId)],
        updateEnabled: true,
      },
    })
  }

  return { success: true }
})
