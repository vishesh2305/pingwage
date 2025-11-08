import { Router } from "express";
import { register, verifyPhone, setPin, login, forgotPin } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/verify-phone", verifyPhone);
router.post("/login", login);
router.post("/forgot-pin", forgotPin);
router.post("/set-pin", protect, setPin); // Protected: must have a valid token from /verify-phone

export default router;