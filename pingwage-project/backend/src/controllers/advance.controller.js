import { prisma } from "../index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { processWageAdvance } from "../services/stripe.service.js";

// Helper function to get fees.
const getFees = () => ({
  instant: { time_minutes: 15, fee: 2.50 },
  same_day: { time_minutes: 240, fee: 1.50 },
  next_day: { time_minutes: 1440, fee: 0.50 }
});

export const getAdvanceLimits = asyncHandler(async (req, res) => {
  // TODO: This logic is duplicated from earnings.controller.
  // In a real app, you would refactor this into a reusable service.
  const userId = req.user.userId;
  const worker = await prisma.workerProfile.findUnique({ where: { user_id: userId } });
  if (!worker) throw new ApiError(404, "Worker profile not found");
  
  // ... (Re-implement the available_now logic from getCurrentEarnings) ...
  const available = 1530.40; // Simulated for now
  const max_amount = 2125.40; // Simulated
  
  const limits = {
    available: available,
    min_amount: 10.00,
    max_amount: max_amount,
    daily_limit: 1000.00,
    daily_used: 0.00 // TODO: Calculate this
  };

  return res.status(200).json(new ApiResponse(200, limits, "Limits fetched"));
});

export const getAdvanceFees = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, getFees(), "Fees fetched"));
});

export const requestAdvance = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { amount, speed, bank_account_id, idempotency_key } = req.body;

  if (!amount || !speed || !bank_account_id || !idempotency_key) {
    throw new ApiError(400, "Missing required fields");
  }
  
  const worker = await prisma.workerProfile.findUnique({ where: { user_id: userId } });
  if (!worker) throw new ApiError(404, "Worker not found");
  
  const existingAdvance = await prisma.advance.findUnique({
    where: { idempotency_key }
  });
  
  if (existingAdvance) {
    return res.status(200).json(new ApiResponse(200, existingAdvance, "Request already processed"));
  }

  // TODO:
  // 1. Validate bank_account_id belongs to user
  // 2. Validate amount against limits from getAdvanceLimits
  
  const fees = getFees();
  const fee = fees[speed]?.fee;
  if (fee === undefined) throw new ApiError(400, "Invalid speed");
  
  const total = parseFloat(amount) + fee;

  const newAdvance = await prisma.advance.create({
    data: {
      worker_id: worker.id,
      employer_id: worker.employer_id,
      amount: parseFloat(amount),
      fee: fee,
      total: total,
      speed: speed,
      status: "pending",
      bank_account_id: bank_account_id,
      idempotency_key: idempotency_key,
      payment_provider: 'stripe' // Defaulting to Stripe
    }
  });
  
  // 7. Send to payment processing queue (Stripe)
  // await processWageAdvance(newAdvance); // Uncomment when Stripe is set up
  console.log(`Sending advance ${newAdvance.id} to Stripe`);

  const response = {
    id: newAdvance.id,
    amount: newAdvance.amount,
    fee: newAdvance.fee,
    total: newAdvance.total,
    status: newAdvance.status,
    estimated_arrival: new Date(Date.now() + fees[speed].time_minutes * 60000).toISOString()
  };

  return res.status(201).json(new ApiResponse(201, response, "Advance request received"));
});

export const getAdvanceHistory = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const worker = await prisma.workerProfile.findUnique({ where: { user_id: userId } });
  if (!worker) throw new ApiError(404, "Worker not found");
  
  const { page = 1, limit = 20, from, to } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  let whereClause = { worker_id: worker.id };
  if (from && to) {
    whereClause.requested_at = { gte: new Date(from), lte: new Date(to) };
  }
  
  const advances = await prisma.advance.findMany({
    where: whereClause,
    orderBy: { requested_at: 'desc' },
    skip: skip,
    take: parseInt(limit)
  });
  
  const total = await prisma.advance.count({ where: whereClause });
  
  const response = {
    total: total,
    page: parseInt(page),
    limit: parseInt(limit),
    data: advances
  };

  return res.status(200).json(new ApiResponse(200, response, "History fetched"));
});