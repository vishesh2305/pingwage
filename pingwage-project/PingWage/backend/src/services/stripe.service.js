import Stripe from "stripe";

let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

export const processWageAdvance = async (advance) => {
  if (!stripe) {
    console.warn("Stripe client not initialized. Check .env variables.");
    return;
  }

  // TODO: This is a complex operation.
  // 1. You need the worker's bank account token from Stripe.
  // 2. You will use Stripe Connect "Payouts" to send money.
  // 3. This is a "stub" - returning a simulated success.
  
  console.log(`SIMULATING payment for advance ${advance.id}: ${advance.amount}`);
  
  // Simulate a short delay
  setTimeout(async () => {
    // Update the advance to 'processing'
    await prisma.advance.update({
      where: { id: advance.id },
      data: { status: 'processing', payment_id: `sim_pi_${advance.id}` }
    });
    
    // Simulate a longer delay for 'completion'
    setTimeout(async () => {
      await prisma.advance.update({
        where: { id: advance.id },
        data: { status: 'completed', completed_at: new Date() }
      });
      console.log(`Advance ${advance.id} marked as completed.`);
      // TODO: Send notification to user
    }, 1000 * 60); // 1 minute
    
  }, 1000 * 5); // 5 seconds
};