/**
 * Content Queue Service - Redis-based job queue for massive parallel processing
 * Handles 10,000+ posts/day with queue management
 */

import { Keyword } from './keywordGenerationService';
import { BlogPost } from '../types/seo';
import { generatePostForKeyword } from './massContentGenerationService';
import { googleIndexing } from './googleIndexingService';
import { socialAmplifier } from './socialAmplificationService';

// Simple in-memory queue (can be upgraded to Redis/Bull later)
interface QueueJob {
  id: string;
  keyword: Keyword;
  priority: number;
  attempts: number;
  createdAt: number;
}

export class ContentQueue {
  private queue: QueueJob[] = [];
  private processing: boolean = false;
  private maxConcurrency: number = 50;
  private activeJobs: Set<string> = new Set();

  /**
   * Add keywords to queue
   */
  async addKeywords(keywords: Keyword[]): Promise<void> {
    for (const keyword of keywords) {
      this.queue.push({
        id: `${keyword.keyword}-${Date.now()}-${Math.random()}`,
        keyword,
        priority: keyword.priority || 5,
        attempts: 0,
        createdAt: Date.now(),
      });
    }

    // Sort by priority
    this.queue.sort((a, b) => b.priority - a.priority);

    // Start processing if not already
    if (!this.processing) {
      this.startProcessing();
    }
  }

  /**
   * Start processing queue
   */
  private async startProcessing(): Promise<void> {
    if (this.processing) return;
    
    this.processing = true;
    console.log(`🚀 Starting queue processing (${this.queue.length} jobs)`);

    while (this.queue.length > 0 || this.activeJobs.size > 0) {
      // Process up to maxConcurrency jobs
      while (this.activeJobs.size < this.maxConcurrency && this.queue.length > 0) {
        const job = this.queue.shift();
        if (!job) break;

        this.processJob(job).catch(err => {
          console.error(`Job ${job.id} failed:`, err);
        });
      }

      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
    console.log('✅ Queue processing complete');
  }

  /**
   * Process a single job
   */
  private async processJob(job: QueueJob): Promise<void> {
    this.activeJobs.add(job.id);

    try {
      // Generate post
      const llmService = await import('./llmService');
      const post = await generatePostForKeyword(job.keyword, llmService);

      if (post) {
        // Immediately amplify and index
        const url = `${process.env.BASE_URL || process.env.FRONTEND_URL || 'https://aibcmedia.com'}/blog/${post.slug}`;
        
        // Do these in parallel, don't wait
        Promise.allSettled([
          googleIndexing.submitUrl(url),
          socialAmplifier.amplifyPost(post),
        ]).catch(err => {
          console.error('Error in post-amplification:', err);
        });
      }
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      
      // Retry if attempts < 3
      if (job.attempts < 3) {
        job.attempts++;
        this.queue.push(job); // Re-queue
      }
    } finally {
      this.activeJobs.delete(job.id);
    }
  }

  /**
   * Get queue stats
   */
  getStats(): {
    queued: number;
    processing: number;
    total: number;
  } {
    return {
      queued: this.queue.length,
      processing: this.activeJobs.size,
      total: this.queue.length + this.activeJobs.size,
    };
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
  }
}

// Singleton instance
export const contentQueue = new ContentQueue();



