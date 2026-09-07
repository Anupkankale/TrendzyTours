import { Router } from "express"
import * as authController from "../controllers/authController.js"
import { loginSchema } from "../validators/authSchema.js"
import { validate } from "../middleware/validate.js"
import { authenticate } from "../middleware/authMiddleware.js"
import { loginLimiter } from "../middleware/rateLimit.js"

const router = Router()

router.post("/login", loginLimiter, validate(loginSchema), authController.login)
router.post("/logout", authController.logout)
router.get("/me", authenticate, authController.me)

export default router
