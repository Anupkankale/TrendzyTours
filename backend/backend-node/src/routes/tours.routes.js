import { Router } from "express"
import * as tourController from "../controllers/tourController.js"

const router = Router()

router.get("/", tourController.index)
router.get("/:slug", tourController.show)

export default router
