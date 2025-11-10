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

/**
 * Helper function to calculate current pay period (same as in earnings controller)
 */
const calculateCurrentPayPeriod = (employer, today) => {
  const { pay_period_frequency, pay_period_end_day } = employer;
  let workAroundDate = new Date(today.toISOString().split('T')[0]);
  let pay_period_start, pay_period_end;

  if (pay_period_frequency === 'bi-weekly') {
    const dayOfMonth = workAroundDate.getDate();
    if (dayOfMonth <= 15) {
      pay_period_start = new Date(workAroundDate.getFullYear(), workAroundDate.getMonth(), 1);
      pay_period_end = new Date(workAroundDate.getFullYear(), workAroundDate.getMonth(), 15);
    } else {
      pay_period_start = new Date(workAroundDate.getFullYear(), workAroundDate.getMonth(), 16);
      pay_period_end = new Date(workAroundDate.getFullYear(), workAroundDate.getMonth() + 1, 0);
    }
  } else if (pay_period_frequency === 'weekly') {
    const endDayOfWeek = parseInt(pay_period_end_day || 5, 10);
    let daysUntilEnd = (endDayOfWeek - workAroundDate.getDay() + 7) % 7;
    pay_period_end = new Date(workAroundDate);
    pay_period_end.setDate(workAroundDate.getDate() + daysUntilEnd);
    pay_period_start = new Date(pay_period_end);
    pay_period_start.setDate(pay_period_end.getDate() - 6);
  } else {
    pay_period_start = new Date(workAroundDate.getFullYear(), workAroundDate.getMonth(), 1);
    pay_period_end = new Date(workAroundDate.getFullYear(), workAroundDate.getMonth() + 1, 0);
  }

  return { pay_period_start, pay_period_end };
};

export const getAdvanceLimits = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  
  const worker = await prisma.workerProfile.findUnique({ 
    where: { user_id: userId },
    include: { employer: true }
  });
  
  if (!worker) throw new ApiError(404, "Worker profile not found");
  if (!worker.employer) throw new ApiError(404, "Employer not linked");
  
  const employer = worker.employer;
  const advanceRate = employer.advance_rate || 0.5;
  
  // Calculate current pay period
  const today = new Date();
  const { pay_period_start, pay_period_end } = calculateCurrentPayPeriod(employer, today);
  
  // Get earnings for current pay period
  const earnings = await prisma.earning.findMany({
    where: {
      user_id: userId,
      date: {
        gte: pay_period_start,
        lte: pay_period_end
      }
    }
  });
  
  const total_earned = earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  
  // Get advances taken this period
  const advancesThisPeriod = await prisma.advance.findMany({
    where: {
      worker_id: worker.id,
      requested_at: {
        gte: pay_period_start,
        lte: pay_period_end
      },
      status: {
        in: ['pending', 'completed']
      }
    }
  });
  
  const totalAdvanced = advancesThisPeriod.reduce(
    (sum, a) => sum + parseFloat(a.total), 
    0
  );
  
  // Calculate available amount
  const max_available = total_earned * advanceRate;
  const available = Math.max(0, max_available - totalAdvanced);
  
  // Get today's advances for daily limit check
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  
  const todayAdvances = await prisma.advance.findMany({
    where: {
      worker_id: worker.id,
      requested_at: {
        gte: todayStart,
        lt: todayEnd
      },
      status: {
        in: ['pending', 'completed']
      }
    }
  });
  
  const daily_used = todayAdvances.reduce((sum, a) => sum + parseFloat(a.total), 0);
  
  const limits = {
    available: parseFloat(available.toFixed(2)),
    min_amount: 10.00,
    max_amount: parseFloat(Math.min(available, 1000.00).toFixed(2)),
    daily_limit: 1000.00,
    daily_used: parseFloat(daily_used.toFixed(2)),
    daily_remaining: parseFloat(Math.max(0, 1000.00 - daily_used).toFixed(2))
  };

  return res.status(200).json(new ApiResponse(200, limits, "Limits fetched"));
});

export const getAdvanceFees = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, getFees(), "Fees fetched"));
});

export const requestAdvance = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { amount, speed, bank_account_id, idempotency_key } = req.body;

  // Validation
  if (!amount || !speed || !bank_account_id || !idempotency_key) {
    throw new ApiError(400, "Missing required fields: amount, speed, bank_account_id, idempotency_key");
  }
  
  const requestedAmount = parseFloat(amount);
  
  if (isNaN(requestedAmount) || requestedAmount <= 0) {
    throw new ApiError(400, "Invalid amount");
  }
  
  if (requestedAmount < 10) {
    throw new ApiError(400, "Minimum advance amount is $10.00");
  }
  
  const worker = await prisma.workerProfile.findUnique({ 
    where: { user_id: userId },
    include: { employer: true }
  });
  
  if (!worker) throw new ApiError(404, "Worker not found");
  if (!worker.employer) throw new ApiError(404, "Employer not linked");
  
  // Check for duplicate idempotency key
  const existingAdvance = await prisma.advance.findUnique({
    where: { idempotency_key }
  });
  
  if (existingAdvance) {
    return res.status(200).json(new ApiResponse(200, existingAdvance, "Request already processed"));
  }

  // Validate bank account belongs to user
  const bankAccount = await prisma.bankAccount.findFirst({
    where: {
      id: bank_account_id,
      user_id: userId
    }
  });
  
  if (!bankAccount) {
    throw new ApiError(400, "Bank account not found or does not belong to you");
  }
  
  // Get advance limits
  const employer = worker.employer;
  const advanceRate = employer.advance_rate || 0.5;
  
  const today = new Date();
  const { pay_period_start, pay_period_end } = calculateCurrentPayPeriod(employer, today);
  
  // Get earnings
  const earnings = await prisma.earning.findMany({
    where: {
      user_id: userId,
      date: { gte: pay_period_start, lte: pay_period_end }
    }
  });
  
  const total_earned = earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  
  // Get advances taken
  const advancesThisPeriod = await prisma.advance.findMany({
    where: {
      worker_id: worker.id,
      requested_at: { gte: pay_period_start, lte: pay_period_end },
      status: { in: ['pending', 'completed'] }
    }
  });
  
  const totalAdvanced = advancesThisPeriod.reduce((sum, a) => sum + parseFloat(a.total), 0);
  const available = Math.max(0, (total_earned * advanceRate) - totalAdvanced);
  
  // Validate fees
  const fees = getFees();
  const feeInfo = fees[speed];
  
  if (!feeInfo) {
    throw new ApiError(400, "Invalid speed. Must be: instant, same_day, or next_day");
  }
  
  const fee = feeInfo.fee;
  const total = requestedAmount + fee;
  
  // Check if amount + fee exceeds available
  if (total > available) {
    throw new ApiError(400, `Insufficient funds. Available: $${available.toFixed(2)}, Requested (including fee): $${total.toFixed(2)}`);
  }
  
  // Check daily limit
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  
  const todayAdvances = await prisma.advance.findMany({
    where: {
      worker_id: worker.id,
      requested_at: { gte: todayStart, lt: todayEnd },
      status: { in: ['pending', 'completed'] }
    }
  });
  
  const daily_used = todayAdvances.reduce((sum, a) => sum + parseFloat(a.total), 0);
  
  if (daily_used + total > 1000) {
    throw new ApiError(400, `Daily limit exceeded. Daily limit: $1000.00, Already used: $${daily_used.toFixed(2)}`);
  }

  // Create the advance
  const newAdvance = await prisma.advance.create({
    data: {
      worker_id: worker.id,
      employer_id: worker.employer_id,
      amount: requestedAmount,
      fee: fee,
      total: total,
      speed: speed,
      status: "pending",
      bank_account_id: bank_account_id,
      idempotency_key: idempotency_key,
      payment_provider: 'stripe'
    }
  });
  
  // Send to payment processing queue (Stripe)
  // await processWageAdvance(newAdvance); // Uncomment when Stripe is set up
  console.log(`✓ Advance created: ${newAdvance.id} for $${newAdvance.total}`);
  console.log(`  Worker: ${worker.id}, Amount: $${newAdvance.amount}, Fee: $${newAdvance.fee}, Speed: ${newAdvance.speed}`);

  const response = {
    id: newAdvance.id,
    amount: parseFloat(newAdvance.amount.toFixed(2)),
    fee: parseFloat(newAdvance.fee.toFixed(2)),
    total: parseFloat(newAdvance.total.toFixed(2)),
    status: newAdvance.status,
    speed: newAdvance.speed,
    estimated_arrival: new Date(Date.now() + feeInfo.time_minutes * 60000).toISOString(),
    requested_at: newAdvance.requested_at.toISOString()
  };

  return res.status(201).json(new ApiResponse(201, response, "Advance request received"));
});

export const getAdvanceHistory = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  
  const worker = await prisma.workerProfile.findUnique({ 
    where: { user_id: userId } 
  });
  
  if (!worker) throw new ApiError(404, "Worker not found");
  
  const { page = 1, limit = 20, from, to } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  let whereClause = { worker_id: worker.id };
  
  if (from && to) {
    whereClause.requested_at = { 
      gte: new Date(from), 
      lte: new Date(to) 
    };
  }
  
  const advances = await prisma.advance.findMany({
    where: whereClause,
    orderBy: { requested_at: 'desc' },
    skip: skip,
    take: parseInt(limit)
  });
  
  const total = await prisma.advance.count({ where: whereClause });
  
  // Format the advances
  const formattedAdvances = advances.map(a => ({
    id: a.id,
    amount: parseFloat(a.amount.toFixed(2)),
    fee: parseFloat(a.fee.toFixed(2)),
    total: parseFloat(a.total.toFixed(2)),
    speed: a.speed,
    status: a.status,
    requested_at: a.requested_at.toISOString(),
    completed_at: a.completed_at ? a.completed_at.toISOString() : null
  }));
  
  const response = {
    total: total,
    page: parseInt(page),
    limit: parseInt(limit),
    total_pages: Math.ceil(total / parseInt(limit)),
    data: formattedAdvances
  };

  return res.status(200).json(new ApiResponse(200, response, "History fetched"));
});