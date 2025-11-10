import cron from 'node-cron';
import { allocateDailyEarnings } from './earnings-allocation.service.js';

/**
 * Initialize all cron jobs
 */
export function initializeCronJobs() {
  console.log('⏰ Initializing cron jobs...');

  // Run daily earnings allocation at midnight every day
  // Format: minute hour day month weekday
  // '0 0 * * *' = every day at 00:00 (midnight)
  cron.schedule('0 0 * * *', async () => {
    console.log('🕛 Midnight - Running daily earnings allocation...');
    try {
      const result = await allocateDailyEarnings();
      console.log('✅ Cron job completed:', result);
    } catch (error) {
      console.error('❌ Cron job failed:', error);
    }
  }, {
    timezone: "Europe/Zurich" // Switzerland timezone
  });

  console.log('✅ Cron jobs initialized');
  console.log('   - Daily earnings allocation: Every day at midnight (Europe/Zurich)');
}
