import { Router } from "express"
import * as otpController from "../controllers/otpController.js"
import { otpSendSchema, otpVerifySchema } from "../validators/otpSchema.js"
import { validate } from "../middleware/validate.js"

const router = Router()

router.post("/send", validate(otpSendSchema), otpController.send)
router.post("/verify", validate(otpVerifySchema), otpController.verify)

export default router
