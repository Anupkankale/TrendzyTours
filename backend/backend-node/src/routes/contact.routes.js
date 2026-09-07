import { Router } from "express"
import { env } from "../config/env.js"
import * as contactController from "../controllers/contactController.js"
import * as newsletterController from "../controllers/newsletterController.js"
import {
  contactSchema,
  contactSchemaWithoutOtp,
  newsletterSchema,
} from "../validators/contactSchema.js"
import { validate } from "../middleware/validate.js"

const router = Router()

router.post(
  "/contact",
  validate(env.otpRequired ? contactSchema : contactSchemaWithoutOtp),
  contactController.store,
)
router.post("/newsletter", validate(newsletterSchema), newsletterController.subscribe)

export default router
