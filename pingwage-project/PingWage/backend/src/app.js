import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mainRouter from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve employer portal static files
app.use("/employer-portal", express.static(path.join(__dirname, "../../employer-portal/public")));

app.use("/api/v1", mainRouter);

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", message: "PingWage API is healthy" });
});

export { app };