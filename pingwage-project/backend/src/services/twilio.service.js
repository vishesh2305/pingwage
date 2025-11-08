import twilio from "twilio";

let client;
if (process.env.TWILIO_ACCOUNT_SID) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export const sendVerificationSms = async (phone, code) => {
  if (!client) {
    console.warn("Twilio client not initialized. Check .env variables.");
    return;
  }
  
  try {
    await client.messages.create({
      body: `Your PingWage verification code is: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    console.log(`SMS sent to ${phone}`);
  } catch (error) {
    console.error("Failed to send SMS:", error.message);
    throw new ApiError(500, "Failed to send verification SMS");
  }
};