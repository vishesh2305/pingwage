import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { 
  getAdvanceLimits, 
  getAdvanceFees, 
  requestAdvance, 
  getAdvanceHistory 
} from "../controllers/advance.controller.js";

const router = Router();
router.use(protect);

router.get("/limits", getAdvanceLimits);
router.get("/fees", getAdvanceFees);
router.post("/request", requestAdvance);
router.get("/", getAdvanceHistory); // This is GET /api/v1/advances

export default router;