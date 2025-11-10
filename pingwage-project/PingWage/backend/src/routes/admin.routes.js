import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { triggerDailyAllocation } from "../controllers/allocation.controller.js";

const router = Router();

// All admin routes are protected
router.use(protect);

// Manually trigger daily earnings allocation
router.post("/allocate-daily-earnings", triggerDailyAllocation);

export default router;
