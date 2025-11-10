import dotenv from "dotenv";
import { app } from "./app.js";
import { PrismaClient } from "@prisma/client";
import { initializeCronJobs } from "./services/cron.service.js";

dotenv.config();

export const prisma = new PrismaClient();

const startServer = () => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);

    // Initialize cron jobs after server starts
    initializeCronJobs();
  });
};

prisma.$connect()
  .then(() => {
    console.log("Database connected successfully.");
    startServer();
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });