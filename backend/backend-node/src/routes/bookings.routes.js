import { Router } from "express"
import * as bookingController from "../controllers/bookingController.js"
import { bookingStoreSchema, bookingUpdateSchema } from "../validators/bookingSchema.js"
import { validate } from "../middleware/validate.js"
import { authenticate } from "../middleware/authMiddleware.js"
import { role } from "../middleware/roleMiddleware.js"

const router = Router()

// Bookings — admin and sales only.
router.use(authenticate, role("admin", "sales"))

router.get("/", bookingController.index)
router.post("/", validate(bookingStoreSchema), bookingController.store)
router.get("/:id", bookingController.show)
router.put("/:id", validate(bookingUpdateSchema), bookingController.update)

export default router
