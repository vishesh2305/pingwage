import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getEmployerProfile,
  getEmployees,
  addEmployee,
  removeEmployee,
  verifyCompanyId
} from "../controllers/employer.controller.js";

const router = Router();

// Public route for company verification during onboarding
router.post("/:employerId/verify", protect, verifyCompanyId);

// Protected routes (require employer authentication)
router.use(protect);
router.get("/me", getEmployerProfile);
router.get("/employees", getEmployees);
router.post("/employees", addEmployee);
router.delete("/employees/:workerId", removeEmployee);

export default router;
