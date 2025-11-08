import express from "express";
import cors from "cors";
import mainRouter from "./routes/index.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/api/v1", mainRouter);

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", message: "PingWage API is healthy" });
});

export { app };