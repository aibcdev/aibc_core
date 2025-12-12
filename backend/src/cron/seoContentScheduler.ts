/**
 * SEO Content Scheduler - Daily automated content generation
 */

import * as cron from 'node-cron';
import { executeContentPipeline, executeBatchPipeline } from '../services/contentPipelineService';

let scheduledJob: cron.ScheduledTask | null = null;

/**
 * Schedule daily content generation
 */
export function scheduleDailyContentGeneration(
  time: string = '09:00', // Default: 9 AM
  timezone: string = 'America/New_York'
): void {
  // Parse time (HH:MM format)
  const [hours, minutes] = time.split(':').map(Number);
  const cronExpression = `${minutes} ${hours} * * *`; // Every day at specified time

  console.log(`[Content Scheduler] Scheduling daily content generation at ${time} (${timezone})`);

  if (scheduledJob) {
    scheduledJob.stop();
  }

  scheduledJob = cron.schedule(
    cronExpression,
    async () => {
      console.log('[Content Scheduler] Starting daily content generation...');
      try {
        // Generate 1-2 posts per day
        const postsPerDay = Math.random() > 0.5 ? 2 : 1;
        const results = await executeBatchPipeline(postsPerDay);

        const successCount = results.filter(r => r.success).length;
        console.log(`[Content Scheduler] Completed: ${successCount}/${postsPerDay} posts generated successfully`);

        results.forEach((result, index) => {
          if (result.success) {
            console.log(`[Content Scheduler] Post ${index + 1}: ${result.slug} (SEO Score: ${result.seoScore})`);
          } else {
            console.error(`[Content Scheduler] Post ${index + 1} failed: ${result.error}`);
          }
        });
      } catch (error: any) {
        console.error('[Content Scheduler] Error during scheduled generation:', error);
      }
    },
    {
      scheduled: true,
      timezone,
    }
  );
}

/**
 * Stop scheduled content generation
 */
export function stopScheduledContentGeneration(): void {
  if (scheduledJob) {
    scheduledJob.stop();
    scheduledJob = null;
    console.log('[Content Scheduler] Stopped scheduled content generation');
  }
}

/**
 * Execute content generation immediately (for testing)
 */
export async function executeNow(): Promise<void> {
  console.log('[Content Scheduler] Executing content generation now...');
  try {
    const results = await executeBatchPipeline(1);
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`[Content Scheduler] Success: ${result.slug} (SEO Score: ${result.seoScore})`);
      } else {
        console.error(`[Content Scheduler] Failed: ${result.error}`);
      }
    });
  } catch (error: any) {
    console.error('[Content Scheduler] Error:', error);
    throw error;
  }
}

