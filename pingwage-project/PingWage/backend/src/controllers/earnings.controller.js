import { prisma } from "../index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getCurrentEarnings = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const worker = await prisma.workerProfile.findUnique({
    where: { user_id: userId }
  });
  if (!worker) throw new ApiError(404, "Worker profile not found");

  const earningsRecord = await prisma.earning.findFirst({
    where: { worker_id: worker.id },
    orderBy: { pay_period_end: 'desc' }
  });

  if (!earningsRecord) {
    // Return a zero-state object
    return res.status(200).json(new ApiResponse(200, {
      total_earned: 0,
      available_now: 0,
      hours_worked: 0,
      hourly_rate: 0,
      next_payday: null
    }, "No earnings data found."));
  }

  const advances = await prisma.advance.findMany({
    where: {
      worker_id: worker.id,
      status: { in: ['completed', 'pending', 'processing'] },
      requested_at: {
        gte: earningsRecord.pay_period_start,
        lte: earningsRecord.pay_period_end
      }
    }
  });

  const totalWithdrawn = advances.reduce((sum, adv) => sum + adv.total, 0); // Total = amount + fee
  const pendingWithdrawals = advances
    .filter(adv => adv.status === 'pending' || adv.status === 'processing')
    .reduce((sum, adv) => sum + adv.amount, 0);
  
  const totalEarned = earningsRecord.total_earned;
  
  // Logic from
  const maxAllowed = totalEarned * 0.50; // 50% limit
  const available = totalEarned - totalWithdrawn;
  
  const availableNow = Math.max(0, Math.min(available, maxAllowed - totalWithdrawn));
  
  const response = {
    total_earned: totalEarned,
    available_now: availableNow,
    hours_worked: earningsRecord.hours_worked,
    hourly_rate: earningsRecord.hourly_rate,
    next_payday: earningsRecord.pay_period_end,
    pay_period_start: earningsRecord.pay_period_start,
    pay_period_end: earningsRecord.pay_period_end
  };

  return res.status(200).json(
    new ApiResponse(200, response, "Current earnings fetched")
  );
});