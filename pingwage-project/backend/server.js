// A simplified example for the register endpoint
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const twilio = require('twilio'); // You need to configure this

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// POST /api/v1/auth/register
app.post('/api/v1/auth/register', async (req, res) => {
  const { phone, country_code } = req.body;
  
  // 1. Generate a verification code (e.g., '123456')
  const verificationCode = '123456'; // (Make this random)

  // 2. Save the code (e.g., to the 'verification_codes' table )
  await prisma.verification_codes.create({
    data: {
      phone: phone,
      code: verificationCode,
      expires_at: new Date(Date.now() + 10 * 60000) // 10 minutes
    }
  });

  // 3. Send SMS via Twilio (this is simplified)
  // await twilio.messages.create({
  //   body: `Your PingWage code is ${verificationCode}`,
  //   from: 'your_twilio_number',
  //   to: phone
  // });

  // 4. Create the user (or find existing one)
  const user = await prisma.user.upsert({
      where: { phone: phone },
      update: {},
      create: { phone: phone, role: 'worker', status: 'active' }
  });

  // 5. Return success 
  res.json({ user_id: user.id, verification_sent: true });
});

// ... build ALL other endpoints from the doc 
// e.g., /verify-phone, /set-pin, /login
// For /set-pin , use bcrypt to hash the PIN before saving
// For /login , use bcrypt.compare()

app.listen(3001, () => {
  console.log('Backend server running on port 3001');
});