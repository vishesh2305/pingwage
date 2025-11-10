import { prisma } from "../index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationSms } from "../services/twilio.service.js";

/**
 * @route POST /api/v1/auth/register
 * @desc Send verification code to phone number
 * @access Public
 */
export const register = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    throw new ApiError(400, "Phone number is required");
  }
  
  // Basic phone validation
  if (phone.length < 10) {
    throw new ApiError(400, "Invalid phone number format");
  }

  // 1. Generate a 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 2. Delete any existing unverified codes for this phone
  await prisma.verificationCode.deleteMany({
    where: {
      phone: phone,
      verified: false
    }
  });
  
  // 3. Save the new code and its expiry (10 minutes)
  await prisma.verificationCode.create({
    data: {
      phone: phone,
      code: verificationCode,
      expires_at: new Date(Date.now() + 10 * 60 * 1000)
    }
  });

  // 4. Send the code via Twilio
  // await sendVerificationSms(phone, verificationCode); // Uncomment when Twilio is set up
  console.log(`📱 Sending code ${verificationCode} to ${phone}`);

  // 5. Find or create the user
  const user = await prisma.user.upsert({
    where: { phone },
    update: {}, // If user exists, don't update anything
    create: { 
      phone, 
      role: "worker", 
      status: "active" 
    },
  });

  return res.status(200).json(
    new ApiResponse(200, { 
      user_id: user.id, 
      verification_sent: true 
    }, "Verification code sent")
  );
});

/**
 * @route POST /api/v1/auth/verify-phone
 * @desc Verify phone number with code
 * @access Public
 */
export const verifyPhone = asyncHandler(async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    throw new ApiError(400, "Phone and code are required");
  }

  // Find valid verification code
  const vCode = await prisma.verificationCode.findFirst({
    where: { 
      phone, 
      code, 
      expires_at: { gte: new Date() },
      verified: false
    }
  });

  if (!vCode) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  // Mark code as verified
  await prisma.verificationCode.update({
    where: { id: vCode.id },
    data: { verified: true }
  });

  const user = await prisma.user.findUnique({ where: { phone } });
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  // Generate a temporary token to allow setting a PIN and completing onboarding
  const token = jwt.sign(
    { userId: user.id, role: user.role, verified: true },
    process.env.JWT_SECRET,
    { expiresIn: "10m" } // Short-lived token for onboarding
  );

  return res.status(200).json(
    new ApiResponse(200, { 
      token, 
      user_id: user.id, 
      verified: true 
    }, "Phone verified")
  );
});

/**
 * @route POST /api/v1/auth/set-pin
 * @desc Set a 4-digit PIN for the user (called during onboarding)
 * @access Private (Temporary token)
 */
export const setPin = asyncHandler(async (req, res) => {
  const { pin } = req.body;
  const userId = req.user.userId;

  if (!pin || pin.length !== 4) {
    throw new ApiError(400, "A 4-digit PIN is required");
  }
  
  // Validate PIN is numeric
  if (!/^\d{4}$/.test(pin)) {
    throw new ApiError(400, "PIN must be 4 digits");
  }

  const pin_hash = await bcrypt.hash(pin, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { pin_hash },
  });

  return res.status(200).json(
    new ApiResponse(200, { success: true }, "PIN set successfully")
  );
});

/**
 * @route POST /api/v1/auth/login
 * @desc Login with phone and PIN
 * @access Public
 */
export const login = asyncHandler(async (req, res) => {
  const { phone, pin } = req.body;

  if (!phone || !pin) {
    throw new ApiError(400, "Phone and PIN are required");
  }

  const user = await prisma.user.findUnique({ where: { phone } });
  
  if (!user || !user.pin_hash) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPinCorrect = await bcrypt.compare(pin, user.pin_hash);
  
  if (!isPinCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate access token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "7d" }
  );
  
  const userResponse = { 
    id: user.id, 
    phone: user.phone, 
    email: user.email, 
    role: user.role 
  };

  return res.status(200).json(
    new ApiResponse(200, { 
      token, 
      refresh_token: null, 
      user: userResponse 
    }, "Login successful")
  );
});

/**
 * @route POST /api/v1/auth/forgot-pin
 * @desc Send verification code to reset PIN
 * @access Public
 */
export const forgotPin = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    throw new ApiError(400, "Phone number is required");
  }
  
  const user = await prisma.user.findUnique({ where: { phone } });
  
  if (user) {
    // 1. Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Delete any existing unverified codes for this phone
    await prisma.verificationCode.deleteMany({
      where: {
        phone: phone,
        verified: false
      }
    });
    
    // 3. Save code
    await prisma.verificationCode.create({
      data: {
        phone: phone,
        code: verificationCode,
        expires_at: new Date(Date.now() + 10 * 60 * 1000)
      }
    });
    
    // 4. Send SMS
    // await sendVerificationSms(phone, verificationCode); // Uncomment when Twilio is set up
    console.log(`📱 Sending PIN reset code ${verificationCode} to ${phone}`);
  }
  
  // Always return success (don't reveal if phone exists or not for security)
  return res.status(200).json(
    new ApiResponse(200, { verification_sent: true }, "If this number is registered, a PIN reset code has been sent")
  );
});

/**
 * @route POST /api/v1/auth/reset-pin
 * @desc Reset PIN with verification code
 * @access Public
 */
export const resetPin = asyncHandler(async (req, res) => {
  const { phone, code, new_pin } = req.body;

  if (!phone || !code || !new_pin) {
    throw new ApiError(400, "Phone, code, and new PIN are required");
  }

  if (new_pin.length !== 4 || !/^\d{4}$/.test(new_pin)) {
    throw new ApiError(400, "PIN must be 4 digits");
  }

  // Verify code
  const vCode = await prisma.verificationCode.findFirst({
    where: { 
      phone, 
      code, 
      expires_at: { gte: new Date() },
      verified: false
    }
  });

  if (!vCode) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  // Mark code as verified
  await prisma.verificationCode.update({
    where: { id: vCode.id },
    data: { verified: true }
  });

  // Update PIN
  const user = await prisma.user.findUnique({ where: { phone } });
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const pin_hash = await bcrypt.hash(new_pin, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { pin_hash }
  });

  return res.status(200).json(
    new ApiResponse(200, { success: true }, "PIN reset successfully")
  );
});