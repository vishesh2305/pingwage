import { prisma } from "../index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * @route GET /api/v1/workers/me
 * @desc Get the logged-in worker's full profile.
 * @access Private (Worker)
 */
export const getWorkerProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  // CRITICAL FIX: bank_accounts is linked to User, not WorkerProfile
  // So we fetch it separately
  const profile = await prisma.workerProfile.findUnique({
    where: { user_id: userId },
    include: {
      employer: { 
        select: { 
          company_name: true
        } 
      },
      user: true // Include user to get phone/email
    }
  });

  if (!profile) {
    // This is a fallback, but the upsert logic in updateWorkerProfile is better
    const newProfile = await prisma.workerProfile.create({
      data: { 
        user: { connect: { id: userId } }
      },
      include: {
        user: true
      }
    });
    
    return res.status(200).json(new ApiResponse(200, {
      ...newProfile,
      bank_accounts: [] // No bank accounts yet
    }, "New profile created"));
  }
  
  // Fetch bank accounts separately (they're linked to User, not WorkerProfile)
  const bankAccounts = await prisma.bankAccount.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' }
  });

  const response = { 
    ...profile,
    phone: profile.user?.phone,
    email: profile.user?.email,
    bank_accounts: bankAccounts
  };

  return res.status(200).json(new ApiResponse(200, response, "Profile fetched"));
});

/**
 * @route PUT /api/v1/workers/me
 * @desc Update or Create the logged-in worker's profile (for onboarding).
 * @access Private (Worker)
 */
export const updateWorkerProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { first_name, last_name, email, date_of_birth } = req.body;

  // Validation
  if (!first_name) {
    throw new ApiError(400, "First name is required");
  }

  const profileData = {
    first_name,
    last_name: last_name || '',
    date_of_birth: date_of_birth ? new Date(date_of_birth) : null
  };

  // Use upsert to handle both create and update
  const updatedProfile = await prisma.workerProfile.upsert({
    where: { user_id: userId },
    
    // Data to use if UPDATING an existing profile
    update: profileData,
    
    // Data to use if CREATING a new profile
    create: {
      ...profileData,
      user: { connect: { id: userId } }
    },
    include: {
      user: true
    }
  });

  // Also update email on the main user model if provided
  if (email) {
    await prisma.user.update({
      where: { id: userId },
      data: { email }
    });
  }

  // Return the profile with id for frontend to store
  return res.status(200).json(
    new ApiResponse(200, { 
      success: true, 
      id: updatedProfile.id,
      user_id: userId,
      profile: updatedProfile 
    }, "Profile updated")
  );
});

/**
 * @route POST /api/v1/workers/bank-account
 * @desc Add a new bank account to the worker's profile.
 * @access Private (Worker)
 */
export const addBankAccount = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { iban, bank_name } = req.body;

  if (!iban) throw new ApiError(400, "IBAN is required");

  // Basic IBAN validation (length check)
  const cleanIban = iban.replace(/\s/g, ''); // Remove spaces
  if (cleanIban.length < 15 || cleanIban.length > 34) {
    throw new ApiError(400, "Invalid IBAN format");
  }

  const newAccount = await prisma.bankAccount.create({
    data: {
      iban: cleanIban,
      bank_name: bank_name || '',
      verified: false,
      user: { connect: { id: userId } }
    }
  });

  return res.status(201).json(new ApiResponse(201, newAccount, "Bank account added"));
});

/**
 * @route GET /api/v1/workers/bank-accounts
 * @desc Get all of the worker's bank accounts.
 * @access Private (Worker)
 */
export const getBankAccounts = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const accounts = await prisma.bankAccount.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' }
  });

  return res.status(200).json(new ApiResponse(200, accounts, "Bank accounts fetched"));
});


/**
 * @route POST /api/v1/workers/profile-photo
 * @desc Upload or update the worker's profile photo.
 * @access Private (Worker)
 */
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const file = req.file;
  
  if (!file) throw new ApiError(400, "No image file uploaded");

  // TODO:
  // 1. Upload the file (from file.buffer) to a cloud storage (e.g., AWS S3, Cloudinary)
  const photo_url = "https://your-cloud-storage.com/simulated-image.jpg"; // (Simulated URL)

  // 2. Save the URL to the worker's profile
  // Use upsert to handle case where profile doesn't exist yet
  await prisma.workerProfile.upsert({
    where: { user_id: userId },
    update: { profile_photo_url: photo_url },
    create: {
      profile_photo_url: photo_url,
      user: { connect: { id: userId } }
    }
  });

  return res.status(200).json(
    new ApiResponse(200, { photo_url }, "Profile photo updated")
  );
});

/**
 * @route GET /api/v1/workers/employers/search
 * @desc Search for employers by name.
 * @access Private (Worker)
 */
export const searchEmployers = asyncHandler(async (req, res) => {
  const { q } = req.query; 

  if (!q) {
    return res.status(200).json(new ApiResponse(200, [], "No query provided"));
  }

  const employers = await prisma.employer.findMany({
    where: {
      company_name: {
        contains: q,
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      company_name: true,
      logo_url: true
    },
    take: 10
  });

  return res.status(200).json(new ApiResponse(200, employers, "Employers fetched"));
});