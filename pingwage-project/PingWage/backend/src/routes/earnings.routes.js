import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getCurrentEarnings, getActivityFeed } from "../controllers/earnings.controller.js";

const router = Router();
router.use(protect);

router.get("/current", getCurrentEarnings);
router.get("/activity", getActivityFeed);

export default router;