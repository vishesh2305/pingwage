import { prisma } from "../index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationSms } from "../services/twilio.service.js";

export const register = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) throw new ApiError(400, "Phone number is required");

  // 1. Generate a 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 2. Save the code and its expiry (10 minutes)
  await prisma.verificationCode.create({
    data: {
      phone: phone,
      code: verificationCode,
      expires_at: new Date(Date.now() + 10 * 60 * 1000)
    }
  });

  // 3. Send the code via Twilio
  // await sendVerificationSms(phone, verificationCode); // Uncomment when Twilio is set up
  console.log(`Sending code ${verificationCode} to ${phone}`); // For testing

  // 4. Find or create the user
  const user = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone, role: "worker", status: "active" },
  });

  return res.status(200).json(
    new ApiResponse(200, { user_id: user.id, verification_sent: true }, "Verification code sent")
  );
});

export const verifyPhone = asyncHandler(async (req, res) => {
  const { phone, code } = req.body;

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
  if (!user) throw new ApiError(404, "User not found");
  
  // Generate a temporary token to allow setting a PIN
  const token = jwt.sign(
    { userId: user.id, role: user.role, verified: true },
    process.env.JWT_SECRET,
    { expiresIn: "10m" } // Short-lived token
  );

  return res.status(200).json(
    new ApiResponse(200, { token, user_id: user.id, verified: true }, "Phone verified")
  );
});

export const setPin = asyncHandler(async (req, res) => {
  const { pin } = req.body;
  const userId = req.user.userId;

  if (!pin || pin.length !== 4) {
    throw new ApiError(400, "A 4-digit PIN is required");
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

export const login = asyncHandler(async (req, res) => {
  const { phone, pin } = req.body;

  if (!phone || !pin) {
    throw new ApiError(400, "Phone and PIN are required");
  }

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !user.pin_hash) {
    throw new ApiError(404, "User not found or no PIN set");
  }

  const isPinCorrect = await bcrypt.compare(pin, user.pin_hash);
  if (!isPinCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "1d" }
  );
  
  const userResponse = { id: user.id, phone: user.phone, email: user.email, role: user.role };

  return res.status(200).json(
    new ApiResponse(200, { token, refresh_token: null, user: userResponse }, "Login successful")
  );
});

export const forgotPin = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  
  const user = await prisma.user.findUnique({ where: { phone } });
  if (user) {
    // 1. Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    // 2. Save code
    await prisma.verificationCode.create({
      data: {
        phone: phone,
        code: verificationCode,
        expires_at: new Date(Date.now() + 10 * 60 * 1000)
      }
    });
    // 3. Send SMS
    // await sendVerificationSms(phone, verificationCode); // Uncomment when Twilio is set up
    console.log(`Sending PIN reset code ${verificationCode} to ${phone}`);
  }
  
  return res.status(200).json(
    new ApiResponse(200, { verification_sent: true }, "PIN reset code sent")
  );
});