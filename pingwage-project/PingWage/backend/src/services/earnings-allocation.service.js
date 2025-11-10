import { prisma } from "../index.js";

/**
 * Allocate daily earnings to all active workers
 * This should run once per day (e.g., at midnight)
 */
export async function allocateDailyEarnings() {
  try {
    console.log('🕐 Starting daily earnings allocation...');

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison

    // Find all worker profiles that:
    // 1. Are linked to an employer
    // 2. Have a daily rate set
    // 3. Haven't been allocated earnings today
    const workers = await prisma.workerProfile.findMany({
      where: {
        employer_id: { not: null },
        daily_rate: { not: null },
        OR: [
          { last_allocation_date: null },
          { last_allocation_date: { lt: today } }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            phone: true
          }
        },
        employer: {
          select: {
            id: true,
            company_name: true
          }
        }
      }
    });

    console.log(`📋 Found ${workers.length} workers eligible for daily allocation`);

    let successCount = 0;
    let errorCount = 0;

    // Allocate earnings for each worker
    for (const worker of workers) {
      try {
        // Create earnings record
        await prisma.earning.create({
          data: {
            user_id: worker.user_id,
            employer_id: worker.employer_id,
            amount: worker.daily_rate,
            date: today,
            notes: `Daily allocation from monthly salary: CHF ${worker.monthly_salary}`
          }
        });

        // Update last allocation date
        await prisma.workerProfile.update({
          where: { id: worker.id },
          data: { last_allocation_date: today }
        });

        console.log(`✓ Allocated CHF ${worker.daily_rate} to ${worker.first_name} (${worker.user.phone})`);
        successCount++;
      } catch (error) {
        console.error(`✗ Failed to allocate for worker ${worker.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`✅ Daily allocation complete: ${successCount} successful, ${errorCount} errors`);

    return {
      success: true,
      allocated: successCount,
      errors: errorCount,
      total: workers.length
    };
  } catch (error) {
    console.error('❌ Daily earnings allocation failed:', error);
    throw error;
  }
}

/**
 * Manually trigger allocation for a specific worker (for testing)
 */
export async function allocateEarningsForWorker(workerId) {
  const worker = await prisma.workerProfile.findUnique({
    where: { id: workerId },
    include: {
      user: true,
      employer: true
    }
  });

  if (!worker) {
    throw new Error('Worker not found');
  }

  if (!worker.employer_id || !worker.daily_rate) {
    throw new Error('Worker must be linked to employer with a daily rate');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create earnings record
  await prisma.earning.create({
    data: {
      user_id: worker.user_id,
      employer_id: worker.employer_id,
      amount: worker.daily_rate,
      date: today,
      notes: `Manual allocation from monthly salary: CHF ${worker.monthly_salary}`
    }
  });

  // Update last allocation date
  await prisma.workerProfile.update({
    where: { id: workerId },
    data: { last_allocation_date: today }
  });

  return {
    success: true,
    amount: worker.daily_rate,
    worker: `${worker.first_name} ${worker.last_name || ''}`.trim()
  };
}
