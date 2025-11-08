import { prisma } from "../index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getWorkerProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const profile = await prisma.workerProfile.findUnique({
    where: { user_id: userId },
    include: {
      bank_accounts: true,
      employer: { select: { company_name: true } }
    }
  });

  if (!profile) {
    const newProfile = await prisma.workerProfile.create({
      data: { user_id: userId }
    });
    return res.status(200).json(new ApiResponse(200, newProfile, "New profile created"));
  }
  
  // Combine user info with profile info
  const user = await prisma.user.findUnique({ where: { id: userId }});
  const response = { ...profile, phone: user.phone };

  return res.status(200).json(new ApiResponse(200, response, "Profile fetched"));
});

export const updateWorkerProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { first_name, last_name, email, date_of_birth } = req.body;

  const updatedProfile = await prisma.workerProfile.update({
    where: { user_id: userId },
    data: {
      first_name,
      last_name,
      date_of_birth: date_of_birth ? new Date(date_of_birth) : null
    }
  });
  
  // Also update email on the main user model
  if (email) {
    await prisma.user.update({
      where: { id: userId },
      data: { email }
    });
  }

  return res.status(200).json(
    new ApiResponse(200, { success: true, user: updatedProfile }, "Profile updated")
  );
});

export const addBankAccount = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { iban, bank_name } = req.body;

  if (!iban) throw new ApiError(400, "IBAN is required");

  const newAccount = await prisma.bankAccount.create({
    data: {
      user_id: userId,
      iban,
      bank_name,
      verified: false
    }
  });

  return res.status(201).json(new ApiResponse(201, newAccount, "Bank account added"));
});

export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw new ApiError(400, "No image file uploaded");

  // TODO:
  // 1. Upload the file (from file.buffer) to a cloud storage (e.g., AWS S3, Cloudinary)
  const photo_url = "https://your-cloud-storage.com/image.jpg"; // (Simulated URL)

  await prisma.workerProfile.update({
    where: { user_id: req.user.userId },
    data: { profile_photo_url: photo_url }
  });

  return res.status(200).json(
    new ApiResponse(200, { photo_url }, "Profile photo updated")
  );
});

export const searchEmployers = asyncHandler(async (req, res) => {
  const { q } = req.query; // Get search query from URL ?q=company_name

  if (!q) {
    return res.status(200).json(new ApiResponse(200, [], "No query provided"));
  }

  const employers = await prisma.employer.findMany({
    where: {
      company_name: {
        contains: q,
        mode: 'insensitive' // Case-insensitive search
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