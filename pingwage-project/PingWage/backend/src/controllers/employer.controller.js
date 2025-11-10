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

  console.log('Looking for employer with user_id:', userId);

  let employer = await prisma.employer.findUnique({
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
    console.error('Employer profile not found for user_id:', userId);

    // Check if user exists and is an employer
    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log('User found:', user?.email, 'Role:', user?.role);

    throw new ApiError(404, "Employer profile not found. Please contact support or re-register.");
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

  // Find or create user by phone (allow adding before employee signs up)
  let user = await prisma.user.findUnique({
    where: { phone }
  });

  if (!user) {
    // Create a placeholder user account for this phone
    // Employee will complete signup when they verify their phone
    user = await prisma.user.create({
      data: {
        phone,
        role: "worker",
        status: "active"
      }
    });
  }

  // Check if worker profile exists
  let workerProfile = await prisma.workerProfile.findUnique({
    where: { user_id: user.id }
  });

  if (!workerProfile) {
    // Create worker profile linked to this employer
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

/**
 * @route POST /api/v1/employers/:employerId/verify
 * @desc Verify company ID and check if employee exists (for onboarding)
 * @access Public (uses tempToken during onboarding)
 */
export const verifyCompanyId = asyncHandler(async (req, res) => {
  const { employerId } = req.params;
  const { phone } = req.body;

  if (!phone) {
    throw new ApiError(400, "Phone number is required");
  }

  console.log('Verifying company ID:', employerId, 'for phone:', phone);

  // Find the employer by ID
  const employer = await prisma.employer.findUnique({
    where: { id: employerId }
  });

  if (!employer) {
    throw new ApiError(404, "Company not found. Please check your Company ID.");
  }

  // Find the user by phone
  const user = await prisma.user.findUnique({
    where: { phone }
  });

  if (!user) {
    throw new ApiError(404, "User not found. Please complete phone verification first.");
  }

  // Check if worker profile exists and is linked to this employer
  const workerProfile = await prisma.workerProfile.findUnique({
    where: { user_id: user.id }
  });

  if (workerProfile && workerProfile.employer_id === employer.id) {
    // Worker is already linked to this employer
    return res.status(200).json(
      new ApiResponse(200, {
        company_name: employer.company_name,
        employee_name: workerProfile.first_name ?
          `${workerProfile.first_name} ${workerProfile.last_name || ''}`.trim() : null
      }, "Company verified and employee found")
    );
  }

  // Worker not found in this company
  throw new ApiError(404, "You are not registered with this company. Please ask your employer to add you first.");
});
