import { prisma } from "../index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * @route GET /api/v1/employers/me
 * @desc Get the logged-in employer's profile
 * @access Private (Employer)
 */
export const getEmployerProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const employer = await prisma.employer.findUnique({
    where: { user_id: userId },
    include: {
      user: {
        select: {
          email: true,
          phone: true
        }
      }
    }
  });

  if (!employer) {
    throw new ApiError(404, "Employer profile not found");
  }

  return res.status(200).json(new ApiResponse(200, employer, "Employer profile fetched"));
});

/**
 * @route GET /api/v1/employers/employees
 * @desc Get all employees linked to this employer
 * @access Private (Employer)
 */
export const getEmployees = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  // First get the employer record
  const employer = await prisma.employer.findUnique({
    where: { user_id: userId }
  });

  if (!employer) {
    throw new ApiError(404, "Employer profile not found");
  }

  // Get all worker profiles linked to this employer
  const employees = await prisma.workerProfile.findMany({
    where: { employer_id: employer.id },
    include: {
      user: {
        select: {
          phone: true,
          email: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  return res.status(200).json(new ApiResponse(200, employees, "Employees fetched"));
});

/**
 * @route POST /api/v1/employers/employees
 * @desc Add a new employee by phone number
 * @access Private (Employer)
 */
export const addEmployee = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { phone, name } = req.body;

  if (!phone) {
    throw new ApiError(400, "Phone number is required");
  }

  // Get employer record
  const employer = await prisma.employer.findUnique({
    where: { user_id: userId }
  });

  if (!employer) {
    throw new ApiError(404, "Employer profile not found");
  }

  // Find user by phone
  const user = await prisma.user.findUnique({
    where: { phone }
  });

  if (!user) {
    throw new ApiError(404, `No user found with phone number ${phone}. They need to sign up first.`);
  }

  // Check if worker profile exists
  let workerProfile = await prisma.workerProfile.findUnique({
    where: { user_id: user.id }
  });

  if (!workerProfile) {
    // Create worker profile if it doesn't exist
    workerProfile = await prisma.workerProfile.create({
      data: {
        user: { connect: { id: user.id } },
        employer: { connect: { id: employer.id } },
        first_name: name || ''
      }
    });
  } else {
    // Update existing worker profile to link to this employer
    workerProfile = await prisma.workerProfile.update({
      where: { user_id: user.id },
      data: {
        employer_id: employer.id,
        first_name: name || workerProfile.first_name
      }
    });
  }

  return res.status(201).json(
    new ApiResponse(201, workerProfile, "Employee added successfully")
  );
});

/**
 * @route DELETE /api/v1/employers/employees/:workerId
 * @desc Remove an employee from the employer
 * @access Private (Employer)
 */
export const removeEmployee = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { workerId } = req.params;

  // Get employer record
  const employer = await prisma.employer.findUnique({
    where: { user_id: userId }
  });

  if (!employer) {
    throw new ApiError(404, "Employer profile not found");
  }

  // Find worker profile
  const workerProfile = await prisma.workerProfile.findUnique({
    where: { id: workerId }
  });

  if (!workerProfile) {
    throw new ApiError(404, "Worker not found");
  }

  // Check if this worker belongs to this employer
  if (workerProfile.employer_id !== employer.id) {
    throw new ApiError(403, "This worker does not belong to your company");
  }

  // Unlink the worker from this employer (set employer_id to null)
  await prisma.workerProfile.update({
    where: { id: workerId },
    data: { employer_id: null }
  });

  return res.status(200).json(new ApiResponse(200, null, "Employee removed successfully"));
});
