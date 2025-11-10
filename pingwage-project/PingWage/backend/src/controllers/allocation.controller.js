import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { allocateDailyEarnings } from "../services/earnings-allocation.service.js";

/**
 * @route POST /api/v1/admin/allocate-daily-earnings
 * @desc Manually trigger daily earnings allocation (for testing)
 * @access Private (Admin/Testing)
 */
export const triggerDailyAllocation = asyncHandler(async (req, res) => {
  console.log('📍 Manual allocation triggered by:', req.user.userId);

  const result = await allocateDailyEarnings();

  return res.status(200).json(
    new ApiResponse(200, result, "Daily allocation completed")
  );
});
