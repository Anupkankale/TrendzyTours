import { Router } from "express"
import * as tourController from "../controllers/tourController.js"
import { tourStoreSchema, tourUpdateSchema } from "../validators/tourSchema.js"
import { validate } from "../middleware/validate.js"
import { authenticate } from "../middleware/authMiddleware.js"
import { role } from "../middleware/roleMiddleware.js"

const router = Router()

// Tours dashboard — admin only.
router.use(authenticate, role("admin"))

router.get("/", tourController.adminIndex)
router.post("/", validate(tourStoreSchema), tourController.store)
router.get("/:id", tourController.adminShow)
router.put("/:id", validate(tourUpdateSchema), tourController.update)
router.delete("/:id", tourController.destroy)

export default router
