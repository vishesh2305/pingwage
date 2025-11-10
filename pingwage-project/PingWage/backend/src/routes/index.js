import { Router } from "express";
import authRouter from "./auth.routes.js";
import workerRouter from "./worker.routes.js";
import earningsRouter from "./earnings.routes.js";
import advanceRouter from "./advance.routes.js";
import employerRouter from "./employer.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/workers", workerRouter);
router.use("/earnings", earningsRouter);
router.use("/advances", advanceRouter);
router.use("/employers", employerRouter);

export default router;