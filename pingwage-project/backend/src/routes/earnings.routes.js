import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getCurrentEarnings } from "../controllers/earnings.controller.js";

const router = Router();
router.use(protect);

router.get("/current", getCurrentEarnings);

export default router;