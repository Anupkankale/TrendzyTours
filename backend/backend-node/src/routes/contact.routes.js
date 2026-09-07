import { Router } from "express"
import * as contactController from "../controllers/contactController.js"
import * as newsletterController from "../controllers/newsletterController.js"
import { contactSchema, newsletterSchema } from "../validators/contactSchema.js"
import { validate } from "../middleware/validate.js"
import { contactLimiter } from "../middleware/rateLimit.js"

const router = Router()

router.post("/contact", contactLimiter, validate(contactSchema), contactController.store)
router.post("/newsletter", contactLimiter, validate(newsletterSchema), newsletterController.subscribe)

export default router
