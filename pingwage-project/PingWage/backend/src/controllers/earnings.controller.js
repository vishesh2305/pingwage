import { prisma } from "../index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Helper function to calculate the start and end of the current pay period.
 * This is a complex but essential piece of logic for EWA.
 *
 * @param {object} employer - The employer object from Prisma
 * @param {Date} today - The current date (e.g., new Date())
 * @returns {object} { pay_period_start, pay_period_end }
 */
const calculateCurrentPayPeriod = (employer, today) => {
  const { pay_period_frequency, pay_period_end_day } = employer;
  
  // Make a copy of 'today' to avoid modifying the original
  let workAroundDate = new Date(today.toISOString().split('T')[0]);

  let pay_period_start, pay_period_end;

  // Example logic for a 'bi-weekly' (every 2 weeks) employer
  // This assumes 'pay_period_end_day' is a weekday number (0-6, Sunday=0)
  // or a date of the month (1-31).
  // This logic will need to be adapted to your *exact* business rules.
  
  if (pay_period_frequency === 'bi-weekly') {
    // This is a simplified example. A robust implementation would need
    // a "reference" pay period start date to calculate from.
    // For this example, let's assume 'pay_period_end_day' is the 15th and 30th/31st.
    
    // --- THIS IS SIMPLIFIED LOGIC ---
    // A real system would be more complex
    const dayOfMonth = workAroundDate.getDate();
    
    if (dayOfMonth <= 15) {
      // We are in the first period of the month
      pay_period_start = new Date(workAroundDate.getFullYear(), workAroundDate.getMonth(), 1);
      pay_period_end = new Date(workAroundDate.getFullYear(), workAroundDate.getMonth(), 15);
    } else {
      // We are in the second period of the month
      pay_period_start = new Date(workAroundDate.getFullYear(), workAroundDate.getMonth(), 16);
      // Get last day of current month
      pay_period_end = new Date(workAroundDate.getFullYear(), workAroundDate.getMonth() + 1, 0);
    }
    // --- END SIMPLIFIED LOGIC ---
    
  } else if (pay_period_frequency === 'weekly') {
    // Example: Pay period ends every Friday (Day 5)
    const endDayOfWeek = parseInt(pay_period_end_day || 5, 10); // Default to Friday
    let daysUntilEnd = (endDayOfWeek - workAroundDate.getDay() + 7) % 7;
    
    pay_period_end = new Date(workAroundDate);
    pay_period_end.setDate(workAroundDate.getDate() + daysUntilEnd);
    
    pay_period_start = new Date(pay_period_end);
    pay_period_start.setDate(pay_period_end.getDate() - 6); // 7 days total

  } else {
    // Default or other frequencies (e.g., 'monthly')
    // Assume monthly, ending on the last day of the month
    pay_period_start = new Date(workAroundDate.getFullYear(), workAroundDate.getMonth(), 1);
    pay_period_end = new Date(workAroundDate.getFullYear(), workAroundDate.getMonth() + 1, 0);
  }

  // Return dates as Date objects
  return { pay_period_start, pay_period_end };
};


/**
 * @route GET /api/v1/earnings/current
 * @desc Get worker's current earned wage, available advance, and pay period.
 * @access Private (Worker)
 */
export const getCurrentEarnings = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  // 1. Get user's profile and employer details
  const profile = await prisma.workerProfile.findUnique({
    where: { user_id: userId },
    include: { employer: true }
  });

  if (!profile || !profile.employer) {
    throw new ApiError(404, "Worker profile or linked employer not found");
  }

  const employer = profile.employer;
  const advanceRate = employer.advance_rate || 0.5; // e.g., 0.5 (for 50%), default to 50%

  // 2. Calculate current pay period
  const today = new Date();
  const { pay_period_start, pay_period_end } = calculateCurrentPayPeriod(employer, today);

  // 3. Find all earnings within this pay period
  const earnings = await prisma.earning.findMany({
    where: {
      user_id: userId,
      date: {
        gte: pay_period_start,
        lte: pay_period_end
      }
    }
  });

  // 4. Calculate total earned
  const total_earned = earnings.reduce((sum, earning) => sum + parseFloat(earning.amount), 0);
  
  // 5. Calculate advances taken this period
  const advancesThisPeriod = await prisma.advance.findMany({
    where: {
      worker_id: profile.id, // Use worker_id (WorkerProfile ID), not user_id
      requested_at: {
        gte: pay_period_start,
        lte: pay_period_end
      },
      status: {
        in: ['pending', 'completed'] // Don't count failed/cancelled advances
      }
    }
  });

  const totalAdvanced = advancesThisPeriod.reduce(
    (sum, advance) => sum + parseFloat(advance.total), 
    0
  );

  // 6. Calculate available now
  const available_now = Math.max(0, (total_earned * advanceRate) - totalAdvanced);

  // 7. Format and return response
  const responseData = {
    total_earned: parseFloat(total_earned.toFixed(2)),
    available_now: parseFloat(available_now.toFixed(2)),
    pay_period_start: pay_period_start.toISOString(),
    pay_period_end: pay_period_end.toISOString(),
    advance_rate: advanceRate,
    already_advanced: parseFloat(totalAdvanced.toFixed(2))
  };

  return res.status(200).json(new ApiResponse(200, responseData, "Current earnings fetched"));
});


/**
 * @route GET /api/v1/earnings/activity
 * @desc Get a combined, sorted list of earnings and advances (withdrawals).
 * @access Private (Worker)
 */
export const getActivityFeed = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  // Get worker profile to use worker_id for advances query
  const profile = await prisma.workerProfile.findUnique({
    where: { user_id: userId },
    select: { id: true }
  });

  if (!profile) {
    throw new ApiError(404, "Worker profile not found");
  }

  // 1. Get all earnings
  const earnings = await prisma.earning.findMany({
    where: { user_id: userId },
    orderBy: { date: 'desc' },
    take: 100 // Limit to last 100 earnings
  });

  // 2. Get all completed advances (withdrawals)
  // CRITICAL FIX: Use worker_id (profile.id), not user_id
  const advances = await prisma.advance.findMany({
    where: { 
      worker_id: profile.id, // Use worker_id from WorkerProfile
      status: {
        in: ['completed', 'pending'] // Show both completed and pending
      }
    },
    orderBy: { requested_at: 'desc' },
    take: 100 // Limit to last 100 advances
  });

  // 3. Format earnings into a common activity shape
  const earningsActivity = earnings.map(e => ({
    id: `earn_${e.id}`,
    title: e.notes || 'Wages Earned',
    date: e.date.toISOString(),
    amount: `+$${parseFloat(e.amount).toFixed(2)}`,
    type: 'in', // For frontend UI
    category: 'earning'
  }));

  // 4. Format advances into a common activity shape
  const advancesActivity = advances.map(a => ({
    id: `adv_${a.id}`,
    title: `Withdrawal - ${a.speed === 'instant' ? 'Instant' : a.speed === 'same_day' ? 'Same Day' : 'Next Day'}`,
    date: a.requested_at.toISOString(),
    amount: `-$${parseFloat(a.total).toFixed(2)}`,
    type: 'out', // For frontend UI
    category: 'advance',
    status: a.status
  }));

  // 5. Combine and sort by date (most recent first)
  const activity = [...earningsActivity, ...advancesActivity];
  activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 6. Implement pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedActivity = activity.slice(startIndex, endIndex);

  const response = {
    data: paginatedActivity,
    pagination: {
      page: page,
      limit: limit,
      total: activity.length,
      total_pages: Math.ceil(activity.length / limit)
    }
  };

  return res.status(200).json(new ApiResponse(200, response, "Activity feed fetched"));
});