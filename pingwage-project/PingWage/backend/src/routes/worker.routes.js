import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { 
  getWorkerProfile, 
  updateWorkerProfile, 
  addBankAccount,
  uploadProfilePhoto,
  searchEmployers,
  getBankAccounts
} from "../controllers/worker.controller.js";

const router = Router();
router.use(protect); // All worker routes are protected

router.get("/me", getWorkerProfile);
router.put("/me", updateWorkerProfile);
router.get("/bank-accounts", getBankAccounts);
router.post("/bank-account", addBankAccount);
router.post("/profile-photo", upload.single('image'), uploadProfilePhoto);

// This route is from the spec
router.get("/employers/search", searchEmployers);

export default router;