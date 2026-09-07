import { Router } from "express"
import * as leadController from "../controllers/leadController.js"
import { leadStoreSchema, leadUpdateSchema } from "../validators/leadSchema.js"
import { validate } from "../middleware/validate.js"
import { authenticate } from "../middleware/authMiddleware.js"
import { role } from "../middleware/roleMiddleware.js"

const router = Router()

// Leads — admin and sales only.
router.use(authenticate, role("admin", "sales"))

router.get("/", leadController.index)
router.post("/", validate(leadStoreSchema), leadController.store)
router.get("/:id", leadController.show)
router.put("/:id", validate(leadUpdateSchema), leadController.update)

export default router
