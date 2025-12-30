/**
 * SEO Content Scheduler - Daily automated content generation
 */

import * as cron from 'node-cron';
import { executeContentPipeline, executeBatchPipeline } from '../services/contentPipelineService';
import { publishScheduledPost } from '../services/blogScheduler';
import { getTopHolidayEvent } from '../services/holidayEventService';

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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'seoContentScheduler.ts:31',message:'SCHEDULER TRIGGERED',data:{time:new Date().toISOString(),timezone},timestamp:Date.now(),sessionId:'debug-session',runId:'blog-scheduler',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      console.log('[Content Scheduler] Starting daily content generation...');
      
      // Check for relevant holidays/events
      const topEvent = getTopHolidayEvent();
      if (topEvent) {
        const daysUntil = Math.ceil((topEvent.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        console.log(`[Content Scheduler] 🎉 Relevant event detected: ${topEvent.name} (${topEvent.type}, ${daysUntil >= 0 ? `${daysUntil} days away` : `${Math.abs(daysUntil)} days ago`}, ${topEvent.relevance} relevance)`);
      }
      
      try {
        // Step 1: First, try to publish any existing draft posts (ensures at least 1 post per day)
        console.log('[Content Scheduler] Checking for draft posts to publish...');
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'seoContentScheduler.ts:44',message:'CHECKING DRAFT POSTS',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'blog-scheduler',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        const publishResult = await publishScheduledPost();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'seoContentScheduler.ts:47',message:'PUBLISH RESULT',data:{success:publishResult.success,hasPost:!!publishResult.post,error:publishResult.error},timestamp:Date.now(),sessionId:'debug-session',runId:'blog-scheduler',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        if (publishResult.success) {
          console.log(`[Content Scheduler] ✅ Published existing draft: "${publishResult.post?.title}"`);
        } else {
          console.log(`[Content Scheduler] No draft posts available: ${publishResult.error}`);
        }

        // Step 2: Generate 1-2 new posts per day
        const postsPerDay = Math.random() > 0.5 ? 2 : 1;
        console.log(`[Content Scheduler] Generating ${postsPerDay} new post(s)...`);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'seoContentScheduler.ts:54',message:'STARTING GENERATION',data:{postsPerDay},timestamp:Date.now(),sessionId:'debug-session',runId:'blog-scheduler',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
        const results = await executeBatchPipeline(postsPerDay);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'seoContentScheduler.ts:57',message:'GENERATION COMPLETE',data:{successCount:results.filter(r=>r.success).length,total:results.length,errors:results.filter(r=>!r.success).map(r=>r.error)},timestamp:Date.now(),sessionId:'debug-session',runId:'blog-scheduler',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion

        const successCount = results.filter(r => r.success).length;
        const publishedCount = results.filter(r => r.success && r.seoScore && r.seoScore >= 70).length;
        console.log(`[Content Scheduler] Completed: ${successCount}/${postsPerDay} posts generated successfully`);
        console.log(`[Content Scheduler] Published: ${publishedCount} new posts (score >= 70)`);

        results.forEach((result, index) => {
          if (result.success) {
            const status = result.seoScore && result.seoScore >= 70 ? 'PUBLISHED' : 'DRAFT';
            console.log(`[Content Scheduler] Post ${index + 1}: ${result.slug} (SEO Score: ${result.seoScore}, Status: ${status})`);
          } else {
            console.error(`[Content Scheduler] Post ${index + 1} failed: ${result.error}`);
          }
        });

        // Step 3: If no posts were published from generation, try to publish another draft
        if (publishedCount === 0 && !publishResult.success) {
          console.log('[Content Scheduler] No posts published from generation, trying to publish another draft...');
          const secondPublishResult = await publishScheduledPost();
          if (secondPublishResult.success) {
            console.log(`[Content Scheduler] ✅ Published second draft: "${secondPublishResult.post?.title}"`);
          }
        }
      } catch (error: any) {
        console.error('[Content Scheduler] Error during scheduled generation:', error);
        // Fallback: Try to publish a draft even if generation failed
        try {
          const fallbackPublish = await publishScheduledPost();
          if (fallbackPublish.success) {
            console.log(`[Content Scheduler] ✅ Fallback: Published draft: "${fallbackPublish.post?.title}"`);
          }
        } catch (fallbackError) {
          console.error('[Content Scheduler] Fallback publish also failed:', fallbackError);
        }
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

