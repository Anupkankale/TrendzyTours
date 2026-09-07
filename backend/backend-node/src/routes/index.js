import { Router } from "express"
import authRoutes from "./auth.routes.js"
import toursRoutes from "./tours.routes.js"
import adminToursRoutes from "./adminTours.routes.js"
import leadsRoutes from "./leads.routes.js"
import bookingsRoutes from "./bookings.routes.js"
import contactRoutes from "./contact.routes.js"

const router = Router()

// Mirrors backend/routes/api.php, minus the removed OTP endpoints.
router.use("/tours", toursRoutes)
router.use("/", contactRoutes)
router.use("/auth", authRoutes)
router.use("/leads", leadsRoutes)
router.use("/bookings", bookingsRoutes)
router.use("/admin/tours", adminToursRoutes)

export default router
