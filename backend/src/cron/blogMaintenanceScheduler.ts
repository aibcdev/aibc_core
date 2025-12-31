/**
 * Blog Maintenance Scheduler - Daily automated fixing of blog posts
 * Runs at 10 AM (after content generation at 9 AM) to fix any posts that slipped through
 */

import * as cron from 'node-cron';
import { listBlogPosts } from '../services/seoContentService';
import { fixBlogPosts } from '../services/blogPostFixService';

let scheduledJob: cron.ScheduledTask | null = null;

/**
 * Schedule daily blog maintenance (fix images, formatting)
 */
export function scheduleBlogMaintenance(
  time: string = '10:00', // Default: 10 AM (after content generation at 9 AM)
  timezone: string = 'America/New_York'
): void {
  // Parse time (HH:MM format)
  const [hours, minutes] = time.split(':').map(Number);
  const cronExpression = `${minutes} ${hours} * * *`; // Every day at specified time

  console.log(`[Blog Maintenance] Scheduling daily blog maintenance at ${time} (${timezone})`);

  if (scheduledJob) {
    scheduledJob.stop();
  }

  scheduledJob = cron.schedule(
    cronExpression,
    async () => {
      console.log('[Blog Maintenance] Starting daily blog maintenance...');
      
      try {
        // Get all published posts
        const allPosts = await listBlogPosts({ status: 'published', limit: 1000 });
        
        if (!allPosts.posts || allPosts.posts.length === 0) {
          console.log('[Blog Maintenance] No published posts found');
          return;
        }

        console.log(`[Blog Maintenance] Found ${allPosts.posts.length} published posts to check`);

        // Find posts that need fixing
        const postsNeedingFix = allPosts.posts.filter(post => {
          // Missing image
          if (!post.featured_image_url) return true;
          
          // Has TOC
          if (post.content?.match(/Table of Contents|table of contents/i)) return true;
          
          // Has broken HTML
          if (post.content?.match(/<[^>]*[<>{}[\]\\|`~!@#$%^&*+=?;:'"][^>]*>/)) return true;
          
          // Has hardcoded 2024
          if (post.content?.match(/\b2024\b/)) return true;
          
          // Headings not emboldened
          if (post.content?.match(/<h2>[^<]+<\/h2>/i) || post.content?.match(/<h3>[^<]+<\/h3>/i)) return true;
          
          return false;
        });

        if (postsNeedingFix.length === 0) {
          console.log('[Blog Maintenance] ✅ All posts are already correct');
          return;
        }

        console.log(`[Blog Maintenance] Found ${postsNeedingFix.length} posts needing fixes`);

        // Fix all posts
        const result = await fixBlogPosts(postsNeedingFix);

        console.log(`[Blog Maintenance] ✅ Fixed ${result.fixed} posts, ${result.errors} errors`);
      } catch (error: any) {
        console.error('[Blog Maintenance] Error during maintenance:', error);
      }
    },
    {
      scheduled: true,
      timezone,
    }
  );
}

/**
 * Stop scheduled blog maintenance
 */
export function stopBlogMaintenance(): void {
  if (scheduledJob) {
    scheduledJob.stop();
    scheduledJob = null;
    console.log('[Blog Maintenance] Stopped scheduled blog maintenance');
  }
}

/**
 * Execute blog maintenance immediately (for testing)
 */
export async function executeMaintenanceNow(): Promise<void> {
  console.log('[Blog Maintenance] Executing blog maintenance now...');
  try {
    const allPosts = await listBlogPosts({ status: 'published', limit: 1000 });
    
    if (!allPosts.posts || allPosts.posts.length === 0) {
      console.log('[Blog Maintenance] No published posts found');
      return;
    }

    const postsNeedingFix = allPosts.posts.filter(post => {
      if (!post.featured_image_url) return true;
      if (post.content?.match(/Table of Contents|table of contents/i)) return true;
      if (post.content?.match(/<[^>]*[<>{}[\]\\|`~!@#$%^&*+=?;:'"][^>]*>/)) return true;
      if (post.content?.match(/\b2024\b/)) return true;
      if (post.content?.match(/<h2>[^<]+<\/h2>/i) || post.content?.match(/<h3>[^<]+<\/h3>/i)) return true;
      return false;
    });

    if (postsNeedingFix.length === 0) {
      console.log('[Blog Maintenance] ✅ All posts are already correct');
      return;
    }

    const result = await fixBlogPosts(postsNeedingFix);
    console.log(`[Blog Maintenance] ✅ Fixed ${result.fixed} posts, ${result.errors} errors`);
  } catch (error: any) {
    console.error('[Blog Maintenance] Error:', error);
    throw error;
  }
}

