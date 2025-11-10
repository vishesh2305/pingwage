import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getEmployerProfile,
  getEmployees,
  addEmployee,
  removeEmployee
} from "../controllers/employer.controller.js";

const router = Router();
router.use(protect); // All employer routes are protected

router.get("/me", getEmployerProfile);
router.get("/employees", getEmployees);
router.post("/employees", addEmployee);
router.delete("/employees/:workerId", removeEmployee);

export default router;
