import { Router } from "express";
import {
  register,
  verifyPhone,
  setPin,
  login,
  forgotPin,
  registerEmployer,
  loginEmployer
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Worker authentication routes
router.post("/register", register);
router.post("/verify-phone", verifyPhone);
router.post("/login", login);
router.post("/forgot-pin", forgotPin);
router.post("/set-pin", protect, setPin); // Protected: must have a valid token from /verify-phone

// Employer authentication routes
router.post("/register-employer", registerEmployer);
router.post("/login-employer", loginEmployer);

export default router;